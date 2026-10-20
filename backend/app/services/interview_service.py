from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.errors import InvalidStateError, NotFoundError
from app.core.config import Settings, get_settings
from app.models import Answer, AnswerEvaluation, InterviewSession, InterviewSummary, Question, SessionStatus, SpeechMetrics
from app.repositories.interview_repository import InterviewRepository
from app.schemas.answer import AnswerCreate
from app.schemas.interview import InterviewCreate
from app.services.providers import FollowUpDecision, MockAIInterviewer, MockSpeechAnalyzer, TextToSpeech, create_answer_evaluator, create_text_to_speech
from app.services.speech_controller import SpeechState

logger = logging.getLogger(__name__)


class AnswerEvaluationError(RuntimeError):
    """Evaluation failed after the raw answer was durably persisted."""


class InterviewService:
    def __init__(self, db: Session, tts: TextToSpeech | None = None, settings: Settings | None = None, ai_interviewer=None):
        self.db = db
        self.settings = settings if settings is not None else get_settings()
        self.repository = InterviewRepository(db)
        
        if ai_interviewer is not None:
            self.ai = ai_interviewer
        else:
            runtime_settings = get_settings()
            if runtime_settings.openai_api_key:
                from app.ai.interviewer import LLMAIInterviewer
                self.ai = LLMAIInterviewer(api_key=runtime_settings.openai_api_key)
            else:
                self.ai = MockAIInterviewer()
                
        self.analyzer = MockSpeechAnalyzer()
        self.evaluator = create_answer_evaluator(self.settings)
        self.tts = tts if tts is not None else create_text_to_speech()

    def _create_question(self, session_id: UUID, question_number: int, question_text: str, question_type: str) -> Question:
        question = Question(session_id=session_id, question_number=question_number, question_text=question_text, question_type=question_type)
        question._audio_bytes = self.tts.synthesize(question_text)
        return question

    @staticmethod
    def _difficulty_level(value: str) -> int:
        return {"easy": 0, "medium": 1, "hard": 2}.get(value.lower(), 1)

    def _adaptive_difficulty(self, session: InterviewSession) -> str:
        base = self._difficulty_level(session.difficulty)
        evaluations = [answer.evaluation.overall_score for question in session.questions for answer in question.answers if answer.evaluation]
        if not evaluations:
            return ("easy", "medium", "hard")[base]
        average = sum(evaluations) / len(evaluations)
        adjustment = 1 if average >= 80 else -1 if average < 55 else 0
        return ("easy", "medium", "hard")[max(0, min(2, base + adjustment))]

    def _first_question(self, job_role: str, interview_type: str, personality: str, difficulty: str) -> str:
        try:
            return self.ai.first_question(job_role, interview_type, personality=personality, difficulty=difficulty)
        except TypeError:
            return self.ai.first_question(job_role, interview_type)

    def _next_question(self, job_role: str, question_number: int, history: list[dict[str, str]], personality: str, difficulty: str) -> str:
        try:
            return self.ai.next_question(job_role, question_number, history, personality=personality, difficulty=difficulty)
        except TypeError:
            return self.ai.next_question(job_role, question_number, history)

    @staticmethod
    def _coding_question_numbers(session: InterviewSession) -> tuple[int, ...]:
        if session.interview_type != "technical":
            return ()
        count = session.question_count
        coding_count = 1 if count < 4 else 2
        return tuple(
            sorted(
                {
                    max(1, min(count, round((index + 1) * (count + 1) / (coding_count + 1))))
                    for index in range(coding_count)
                }
            )
        )

    def _planned_question(self, session: InterviewSession, question_number: int) -> tuple[str, str]:
        if question_number in self._coding_question_numbers(session):
            coding_generator = getattr(self.ai, "coding_question", None)
            if callable(coding_generator):
                try:
                    return coding_generator(session.job_role, question_number, difficulty=session.difficulty), "coding"
                except Exception:
                    logger.warning("Coding prompt generation failed; using the local prompt fallback", exc_info=True)
            fallback = MockAIInterviewer().coding_question(session.job_role, question_number, difficulty=session.difficulty)
            return fallback, "coding"
        return (
            self._next_question(
                session.job_role,
                question_number,
                self._history(session),
                session.personality,
                self._adaptive_difficulty(session),
            ),
            session.interview_type,
        )

    def create(self, user_id: UUID, data: InterviewCreate) -> InterviewSession:
        session = InterviewSession(user_id=user_id, interview_type=data.interview_type.value, job_role=data.job_role, experience_level=data.experience_level, difficulty=data.difficulty, personality=data.personality, duration=data.duration, question_count=data.question_count, resume_url=str(data.resume_url) if data.resume_url else None, job_description=data.job_description)
        self.db.add(session)
        self.db.flush()
        if 1 in self._coding_question_numbers(session):
            question_text, question_type = self._planned_question(session, 1)
        else:
            question_text = self._first_question(data.job_role, data.interview_type.value, data.personality, data.difficulty)
            question_type = data.interview_type.value
        question = self._create_question(session.id, 1, question_text, question_type)
        self.db.add(question)
        self.db.commit()
        created = self.repository.get_owned(session.id, user_id)
        created_question = next(item for item in created.questions if item.id == question.id)
        created_question._audio_bytes = question._audio_bytes
        return created

    def get(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        session = self.repository.get_owned(session_id, user_id)
        if session is None:
            raise NotFoundError("Interview")
        return session

    def list(self, user_id: UUID, status: SessionStatus | None, limit: int, offset: int):
        return self.repository.list_owned(user_id, status, limit, offset)

    def transition(self, session_id: UUID, user_id: UUID, target: SessionStatus) -> InterviewSession:
        session = self.get(session_id, user_id)
        allowed = {SessionStatus.CREATED: {SessionStatus.ACTIVE, SessionStatus.CANCELLED}, SessionStatus.ACTIVE: {SessionStatus.COMPLETED, SessionStatus.CANCELLED}, SessionStatus.COMPLETED: set(), SessionStatus.CANCELLED: set()}
        if target not in allowed[session.status]:
            raise InvalidStateError(f"Cannot transition interview from {session.status.value} to {target.value}")
        session.status = target
        if target == SessionStatus.ACTIVE:
            session.started_at = datetime.now(timezone.utc)
        if target in {SessionStatus.COMPLETED, SessionStatus.CANCELLED}:
            session.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        return self.get(session_id, user_id)

    def questions(self, session_id: UUID, user_id: UUID) -> list[Question]:
        session = self.get(session_id, user_id)
        return sorted(session.questions, key=lambda item: item.question_number)[:session.question_count]

    def mark_speech_started(self, session_id: UUID, user_id: UUID, generation_id: UUID, question_id: UUID | None) -> InterviewSession:
        session = self.get(session_id, user_id)
        if question_id is not None:
            valid_question = self.db.scalar(select(Question.id).where(Question.id == question_id, Question.session_id == session_id))
            question_id = valid_question
        session.speech_state = SpeechState.AI_SPEAKING.value
        session.speech_generation_id = generation_id
        session.speech_question_id = question_id
        session.interrupted_generation_id = None
        session.interrupted_at = None
        self.db.commit()
        return self.get(session_id, user_id)

    def mark_speech_interrupted(self, session_id: UUID, user_id: UUID, generation_id: UUID) -> InterviewSession:
        session = self.get(session_id, user_id)
        if session.speech_generation_id == generation_id and session.speech_state == SpeechState.AI_SPEAKING.value:
            session.speech_state = SpeechState.USER_SPEAKING.value
            session.speech_generation_id = None
            session.interrupted_generation_id = generation_id
            session.interrupted_at = datetime.now(timezone.utc)
            self.db.commit()
        return self.get(session_id, user_id)

    def mark_user_speaking(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        session = self.get(session_id, user_id)
        if session.speech_state != SpeechState.AI_SPEAKING.value:
            session.speech_state = SpeechState.USER_SPEAKING.value
            self.db.commit()
        return self.get(session_id, user_id)

    def mark_speech_finished(self, session_id: UUID, user_id: UUID, generation_id: UUID) -> InterviewSession:
        session = self.get(session_id, user_id)
        if session.speech_generation_id == generation_id and session.speech_state == SpeechState.AI_SPEAKING.value:
            session.speech_state = SpeechState.IDLE.value
            session.speech_generation_id = None
            self.db.commit()
        return self.get(session_id, user_id)

    def answer(self, question_id: UUID, user_id: UUID, data: AnswerCreate) -> Answer:
        question = self.db.scalar(select(Question).join(InterviewSession).where(Question.id == question_id, InterviewSession.user_id == user_id).options(selectinload(Question.session)))
    def _history(self, session: InterviewSession) -> list[dict[str, str]]:
        history: list[dict[str, str]] = []
        for item in sorted(session.questions, key=lambda value: value.question_number):
            history.append({"role": "assistant", "content": item.question_text})
            latest_answer = max(item.answers, key=lambda answer: answer.attempt_number, default=None)
            if latest_answer:
                history.append({"role": "user", "content": latest_answer.transcript})
        return history

    def _insert_question(self, session: InterviewSession, question: Question, after: Question | None = None) -> Question:
        self.db.add(question)
        if after is None:
            question.question_number = max((item.question_number for item in session.questions), default=0) + 1
            self.db.flush()
            return question
        questions = sorted([item for item in session.questions if item.id != question.id] + [question], key=lambda item: item.question_number)
        insert_at = questions.index(after) + 1
        while insert_at < len(questions) and questions[insert_at].is_follow_up and questions[insert_at].parent_question_id == after.id:
            insert_at += 1
        questions.insert(insert_at, question)

        for index, item in enumerate(questions, start=1):
            item.question_number = -index
        self.db.flush()
        for index, item in enumerate(questions, start=1):
            item.question_number = index
        self.db.flush()
        return question

    def _follow_up_decision(self, question: Question, transcript: str, evaluation: dict) -> FollowUpDecision:
        root_id = question.parent_question_id or question.id
        follow_up_count = sum(
            1 for item in question.session.questions
            if item.is_follow_up and (item.parent_question_id == root_id or item.id == question.id and question.is_follow_up)
        )
        if follow_up_count >= getattr(self.settings, "max_follow_ups_per_question", 1):
            return FollowUpDecision(action="next_question", reason="Follow-up limit reached")
        try:
            decision = self.ai.decide_follow_up(
                job_role=question.session.job_role,
                interview_type=question.session.interview_type,
                experience_level=question.session.experience_level,
                difficulty=self._adaptive_difficulty(question.session),
                personality=question.session.personality,
                question=question.question_text,
                answer=transcript,
                evaluation=evaluation,
                history=self._history(question.session),
                follow_up_count=follow_up_count,
            )
            normalized = decision if isinstance(decision, FollowUpDecision) else FollowUpDecision.from_payload(decision)
            if normalized.question:
                candidate = " ".join(normalized.question.lower().split())
                existing = {" ".join(item.question_text.lower().split()) for item in question.session.questions}
                if candidate in existing or any(candidate in item or item in candidate for item in existing):
                    return FollowUpDecision(action="next_question", reason="Duplicate question rejected")
            return normalized
        except Exception:
            return FollowUpDecision(action="next_question", reason="Decision unavailable")

    def get_question(self, question_id: UUID, user_id: UUID) -> Question:
        question = self.db.scalar(
            select(Question)
            .join(InterviewSession)
            .where(Question.id == question_id, InterviewSession.user_id == user_id)
            .options(selectinload(Question.answers))
        )
        if question is None:
            raise NotFoundError("Question")
        return question

    def get_idempotent_answer(self, session_id: UUID, user_id: UUID, idempotency_key: str) -> Answer | None:
        return self.db.scalar(
            select(Answer)
            .join(InterviewSession)
            .where(
                Answer.session_id == session_id,
                InterviewSession.user_id == user_id,
                Answer.idempotency_key == idempotency_key,
            )
            .options(
                selectinload(Answer.question).selectinload(Question.session),
                selectinload(Answer.speech_metrics),
                selectinload(Answer.evaluation),
            )
        )

    def recover_progression(self, answer: Answer, user_id: UUID) -> InterviewSession:
        """Resume question progression for a persisted answer after a retry."""
        session = self.get(answer.session_id, user_id)
        if session.status == SessionStatus.COMPLETED:
            return session

        questions = list(self.db.scalars(
            select(Question)
            .where(Question.session_id == session.id)
            .options(selectinload(Question.answers))
            .order_by(Question.question_number)
        ).all())
        questions = questions[:session.question_count]
        pending = next((item for item in questions if not item.answers and item.id != answer.question_id), None)
        if pending is not None:
            return session
        if len(questions) >= session.question_count and all(item.answers for item in questions):
            return self.complete(session.id, user_id)

        next_question_number = len(questions) + 1
        next_question_text, next_question_type = self._planned_question(session, next_question_number)
        next_question = self._create_question(session.id, 0, next_question_text, next_question_type)
        self._insert_question(session, next_question)
        self.db.commit()
        return self.get(session.id, user_id)

    def retry(self, question_id: UUID, user_id: UUID, transcript: str, duration: float) -> Answer:
        self.get_question(question_id, user_id)
        duplicate = self.db.scalar(
            select(Answer)
            .where(
                Answer.question_id == question_id,
                Answer.attempt_number > 1,
                Answer.transcript == transcript,
                Answer.duration == duration,
            )
            .options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation))
            .order_by(Answer.attempt_number.asc())
        )
        if duplicate is not None:
            return duplicate

        try:
            return self.answer(question_id, user_id, AnswerCreate(transcript=transcript, duration=duration), is_retry=True, defer_evaluation=True)
        except IntegrityError:
            self.db.rollback()
            duplicate = self.db.scalar(
                select(Answer)
                .where(
                    Answer.question_id == question_id,
                    Answer.transcript == transcript,
                    Answer.duration == duration,
                )
                .options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation))
                .order_by(Answer.attempt_number.desc())
            )
            if duplicate is not None and duplicate.attempt_number > 1:
                return duplicate
            raise

    def answer(self, question_id: UUID, user_id: UUID, data: AnswerCreate, is_retry: bool = False, idempotency_key: str | None = None, session_id: UUID | None = None, defer_evaluation: bool = False) -> Answer:
        existing = self.get_idempotent_answer(session_id, user_id, idempotency_key) if idempotency_key and session_id else None
        if existing is not None:
            return existing

        question = existing.question if existing is not None else self.db.scalar(select(Question).join(InterviewSession).where(Question.id == question_id, InterviewSession.user_id == user_id).options(selectinload(Question.session)))
        if question is None:
            raise NotFoundError("Question")
        if question.session.status not in {SessionStatus.ACTIVE, SessionStatus.COMPLETED} or (question.session.status == SessionStatus.COMPLETED and not is_retry):
            raise InvalidStateError("Answers can only be submitted for active interviews")
        answer = existing
        attempt = self.db.scalar(select(Answer).where(Answer.question_id == question.id).order_by(Answer.attempt_number.desc())) if answer is None else answer
        if attempt is not None and not is_retry and answer is None:
            raise InvalidStateError("Question has already been answered; submit a retry instead")
        if is_retry and attempt is None:
            raise InvalidStateError("Retries require an existing answer")

        if answer is None:
            attempt_number = (attempt.attempt_number + 1) if attempt else 1
            answer = Answer(question_id=question.id, session_id=question.session_id, attempt_number=attempt_number, transcript=data.transcript, duration=data.duration, completed_at=datetime.now(timezone.utc), idempotency_key=idempotency_key)
            self.db.add(answer)
            self.db.flush()
            metrics = self.analyzer.analyze(data.transcript, data.duration)
            self.db.add(SpeechMetrics(answer_id=answer.id, **metrics))
            self.db.commit()
            self.db.refresh(answer)

        if not defer_evaluation:
            try:
                evaluation = self.evaluator.evaluate(answer.transcript, question.question_text)
            except Exception as exc:
                self.db.rollback()
                raise AnswerEvaluationError from exc
            self.db.add(AnswerEvaluation(answer_id=answer.id, **evaluation))
        if not is_retry:
            question.answered_at = datetime.now(timezone.utc)
            question.session.current_question_number = question.question_number
        slots_remaining = len(question.session.questions) < question.session.question_count
        if not is_retry and not defer_evaluation and slots_remaining:
            decision = self._follow_up_decision(question, data.transcript, evaluation)
            if decision.action in {"follow_up", "clarification"} and decision.question:
                root_id = question.parent_question_id or question.id
                try:
                    follow_up = self._create_question(question.session_id, 0, decision.question, question.session.interview_type)
                    follow_up.is_follow_up = True
                    follow_up.parent_question_id = root_id
                    parent = next((item for item in question.session.questions if item.id == root_id), question)
                    self._insert_question(question.session, follow_up, after=parent)
                except Exception:
                    if "follow_up" in locals() and follow_up in self.db:
                        self.db.expunge(follow_up)
        if not is_retry and (defer_evaluation or 'decision' not in locals() or decision.action not in {"follow_up", "clarification"}):
            planned = sorted((item for item in question.session.questions if not item.is_follow_up), key=lambda item: item.question_number)
            next_planned = next((item for item in planned if item.question_number > question.question_number and not item.answers), None)
            if next_planned is None and len(question.session.questions) < question.session.question_count:
                next_question_number = len(question.session.questions) + 1
                next_question_text, next_question_type = self._planned_question(question.session, next_question_number)
                next_question = self._create_question(question.session_id, 0, next_question_text, next_question_type)
                self._insert_question(question.session, next_question)
        self.db.commit()
        self.db.refresh(answer)
        session_questions = list(self.db.scalars(
            select(Question)
            .where(Question.session_id == question.session_id)
            .options(selectinload(Question.answers))
        ).all())
        selected_questions = sorted(session_questions, key=lambda item: item.question_number)[:question.session.question_count]
        if not is_retry and len(selected_questions) >= question.session.question_count and all(item.answers for item in selected_questions):
            self.complete(question.session_id, user_id)
        return answer

    def attempts(self, question_id: UUID, user_id: UUID) -> tuple[list[Answer], int | None]:
        question = self.db.scalar(select(Question).join(InterviewSession).where(Question.id == question_id, InterviewSession.user_id == user_id))
        if question is None:
            raise NotFoundError("Question")
        answers = list(self.db.scalars(select(Answer).where(Answer.question_id == question_id).options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation)).order_by(Answer.attempt_number.asc())).all())
        scores = [answer.evaluation.overall_score for answer in answers if answer.evaluation]
        return answers, (scores[-1] - scores[-2] if len(scores) >= 2 else None)

    def complete(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        session = self.transition(session_id, user_id, SessionStatus.COMPLETED)
        selected_questions = sorted(session.questions, key=lambda item: item.question_number)[:session.question_count]
        latest_answers = [max(item.answers, key=lambda candidate: candidate.attempt_number) for item in selected_questions if item.answers]
        answers = latest_answers
        evaluations = []
        for answer in answers:
            if answer.evaluation is None:
                evaluation = self.evaluator.evaluate(answer.transcript, answer.question.question_text)
                self.db.add(AnswerEvaluation(answer_id=answer.id, **evaluation))
                evaluations.append(evaluation)
            else:
                evaluations.append(answer.evaluation)
        self.db.flush()
        valid_evaluations = [evaluation for evaluation in evaluations if not any("evaluation unavailable" in str(item).lower() for item in (evaluation["weaknesses"] if isinstance(evaluation, dict) else evaluation.weaknesses))]
        scores = [evaluation["overall_score"] if isinstance(evaluation, dict) else evaluation.overall_score for evaluation in valid_evaluations]
        metrics = [answer.speech_metrics for answer in answers if answer.speech_metrics]
        strengths = [item for evaluation in evaluations for item in (evaluation["strengths"] if isinstance(evaluation, dict) else evaluation.strengths)][:5]
        weaknesses = [item for evaluation in evaluations for item in (evaluation["weaknesses"] if isinstance(evaluation, dict) else evaluation.weaknesses) if "evaluation unavailable" not in str(item).lower()][:5]
        recommendations = [item for evaluation in evaluations for item in (evaluation["suggestions"] if isinstance(evaluation, dict) else evaluation.suggestions)][:5]
        if not scores:
            weaknesses = [*weaknesses, "Evaluation unavailable for this session; your answers were saved, but an overall score could not be calculated."]
        self.db.add(InterviewSummary(session_id=session.id, overall_score=round(sum(scores) / len(scores)) if scores else 0, total_questions=len(selected_questions), total_duration=sum(metric.duration_seconds for metric in metrics), average_wpm=round(sum(metric.words_per_minute for metric in metrics) / len(metrics), 2) if metrics else 0, total_filler_words=sum(metric.filler_count for metric in metrics), total_pauses=sum(metric.pause_count for metric in metrics), strengths=strengths or ["Your answers were saved for review."], weaknesses=weaknesses, recommendations=recommendations or ["Add a specific example, explain your actions, and share the result."]))
        self.db.commit()
        return self.get(session_id, user_id)

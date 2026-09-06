from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import InvalidStateError, NotFoundError
from app.models import Answer, AnswerEvaluation, InterviewSession, InterviewSummary, Question, SessionStatus, SpeechMetrics
from app.repositories.interview_repository import InterviewRepository
from app.schemas.answer import AnswerCreate
from app.schemas.interview import InterviewCreate
from app.services.providers import MockAIInterviewer, MockAnswerEvaluator, MockSpeechAnalyzer


class InterviewService:
    def __init__(self, db: Session, ai_interviewer=None):
        self.db = db
        self.repository = InterviewRepository(db)
        
        if ai_interviewer is not None:
            self.ai = ai_interviewer
        else:
            from app.core.config import get_settings
            settings = get_settings()
            if settings.openai_api_key:
                from app.ai.interviewer import LLMAIInterviewer
                self.ai = LLMAIInterviewer(api_key=settings.openai_api_key)
            else:
                self.ai = MockAIInterviewer()
                
        self.analyzer = MockSpeechAnalyzer()
        self.evaluator = MockAnswerEvaluator()

    def create(self, user_id: UUID, data: InterviewCreate) -> InterviewSession:
        session = InterviewSession(user_id=user_id, interview_type=data.interview_type.value, job_role=data.job_role, experience_level=data.experience_level, difficulty=data.difficulty, personality=data.personality, duration=data.duration, question_count=data.question_count, resume_url=str(data.resume_url) if data.resume_url else None, job_description=data.job_description)
        self.db.add(session)
        self.db.flush()
        self.db.add(Question(session_id=session.id, question_number=1, question_text=self.ai.first_question(data.job_role, data.interview_type.value), question_type=data.interview_type.value))
        self.db.commit()
        return self.repository.get_owned(session.id, user_id)

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
        return self.get(session_id, user_id).questions

    def answer(self, question_id: UUID, user_id: UUID, data: AnswerCreate) -> Answer:
        question = self.db.scalar(select(Question).join(InterviewSession).where(Question.id == question_id, InterviewSession.user_id == user_id).options(selectinload(Question.session)))
        if question is None:
            raise NotFoundError("Question")
        if question.session.status != SessionStatus.ACTIVE:
            raise InvalidStateError("Answers can only be submitted for active interviews")
        attempt = self.db.scalar(select(Answer).where(Answer.question_id == question_id).order_by(Answer.attempt_number.desc()))
        attempt_number = (attempt.attempt_number + 1) if attempt else 1
        answer = Answer(question_id=question.id, session_id=question.session_id, attempt_number=attempt_number, transcript=data.transcript, duration=data.duration, completed_at=datetime.now(timezone.utc))
        self.db.add(answer)
        self.db.flush()
        metrics = self.analyzer.analyze(data.transcript, data.duration)
        self.db.add(SpeechMetrics(answer_id=answer.id, **metrics))
        self.db.add(AnswerEvaluation(answer_id=answer.id, **self.evaluator.evaluate(data.transcript, question.question_text)))
        question.answered_at = datetime.now(timezone.utc)
        question.session.current_question_number = question.question_number
        if question.question_number < question.session.question_count:
            next_question_number = question.question_number + 1
            existing_next = self.db.scalar(select(Question).where(Question.session_id == question.session_id, Question.question_number == next_question_number))
            if existing_next is None:
                # Build history
                history = []
                # ensure questions are sorted by number
                sorted_qs = sorted(question.session.questions, key=lambda q: q.question_number)
                for q in sorted_qs:
                    history.append({"role": "assistant", "content": q.question_text})
                    latest_ans = None
                    for a in q.answers:
                        if latest_ans is None or a.attempt_number > latest_ans.attempt_number:
                            latest_ans = a
                    if latest_ans:
                        history.append({"role": "user", "content": latest_ans.transcript})
                
                next_q_text = self.ai.next_question(
                    question.session.job_role, 
                    next_question_number,
                    history
                )
                self.db.add(Question(session_id=question.session_id, question_number=next_question_number, question_text=next_q_text, question_type=question.session.interview_type))
        self.db.commit()
        self.db.refresh(answer)
        if question.question_number == question.session.question_count:
            self.complete(question.session_id, user_id)
        return answer

    def complete(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        session = self.transition(session_id, user_id, SessionStatus.COMPLETED)
        answers = list(self.db.scalars(select(Answer).where(Answer.session_id == session.id).options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation))).all())
        scores = [answer.evaluation.overall_score for answer in answers if answer.evaluation]
        metrics = [answer.speech_metrics for answer in answers if answer.speech_metrics]
        self.db.add(InterviewSummary(session_id=session.id, overall_score=round(sum(scores) / len(scores)) if scores else 0, total_questions=len(session.questions), total_duration=sum(metric.duration_seconds for metric in metrics), average_wpm=round(sum(metric.words_per_minute for metric in metrics) / len(metrics), 2) if metrics else 0, total_filler_words=sum(metric.filler_count for metric in metrics), total_pauses=sum(metric.pause_count for metric in metrics), strengths=["Completed the interview"], weaknesses=[], recommendations=["Review answer feedback"]))
        self.db.commit()
        return self.get(session_id, user_id)

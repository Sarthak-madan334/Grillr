from __future__ import annotations

import asyncio
from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID, uuid4


class SpeechState(StrEnum):
    IDLE = "idle"
    AI_SPEAKING = "ai_speaking"
    USER_SPEAKING = "user_speaking"


@dataclass(frozen=True)
class InterruptionResult:
    interrupted: bool
    generation_id: UUID | None
    state: SpeechState


class SpeechController:
    """Owns cancellable AI speech for one interview WebSocket connection."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._active_generation: UUID | None = None
        self._speech_task: asyncio.Task[object] | None = None
        self._state = SpeechState.IDLE

    @property
    def state(self) -> SpeechState:
        return self._state

    @property
    def active_generation(self) -> UUID | None:
        return self._active_generation

    async def begin_ai_speech(self, task: asyncio.Task[object] | None = None) -> UUID:
        async with self._lock:
            if self._speech_task is not None and not self._speech_task.done():
                self._speech_task.cancel()
            self._active_generation = uuid4()
            self._speech_task = task
            self._state = SpeechState.AI_SPEAKING
            if task is not None:
                self._watch_task(self._active_generation, task)
            return self._active_generation

    async def restore_ai_speech(self, generation_id: UUID) -> bool:
        async with self._lock:
            if self._active_generation is not None:
                return self._active_generation == generation_id
            self._active_generation = generation_id
            self._speech_task = None
            self._state = SpeechState.AI_SPEAKING
            return True

    async def attach_task(self, generation_id: UUID, task: asyncio.Task[object]) -> bool:
        async with self._lock:
            if generation_id != self._active_generation or self._state != SpeechState.AI_SPEAKING:
                task.cancel()
                return False
            self._speech_task = task
            self._watch_task(generation_id, task)
            return True

    async def interrupt(self) -> InterruptionResult:
        async with self._lock:
            generation_id = self._active_generation
            if generation_id is None or self._state != SpeechState.AI_SPEAKING:
                self._state = SpeechState.USER_SPEAKING
                return InterruptionResult(False, None, self._state)

            task = self._speech_task
            self._active_generation = None
            self._speech_task = None
            self._state = SpeechState.USER_SPEAKING
            if task is not None and not task.done():
                task.cancel()
            return InterruptionResult(True, generation_id, self._state)

    async def finish(self, generation_id: UUID) -> bool:
        async with self._lock:
            if generation_id != self._active_generation:
                return False
            self._active_generation = None
            self._speech_task = None
            self._state = SpeechState.IDLE
            return True

    async def accepts_audio(self, generation_id: UUID) -> bool:
        async with self._lock:
            return generation_id == self._active_generation and self._state == SpeechState.AI_SPEAKING

    async def generation_for_audio(self) -> UUID | None:
        async with self._lock:
            return self._active_generation if self._state == SpeechState.AI_SPEAKING else None

    async def close(self) -> None:
        async with self._lock:
            task = self._speech_task
            self._speech_task = None
            self._active_generation = None
            self._state = SpeechState.IDLE
            if task is not None and not task.done():
                task.cancel()

    def _watch_task(self, generation_id: UUID, task: asyncio.Task[object]) -> None:
        task.add_done_callback(lambda _: asyncio.create_task(self.finish(generation_id)))
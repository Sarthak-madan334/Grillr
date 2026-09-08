import asyncio
import pytest

from app.services.speech_controller import SpeechController, SpeechState


async def pending_speech() -> None:
    await asyncio.Event().wait()


@pytest.mark.asyncio
async def test_interrupt_cancels_active_speech_and_invalidates_audio():
    controller = SpeechController()
    task = asyncio.create_task(pending_speech())
    generation_id = await controller.begin_ai_speech(task)

    result = await controller.interrupt()

    assert result.interrupted is True
    assert result.generation_id == generation_id
    assert result.state == SpeechState.USER_SPEAKING
    assert await controller.accepts_audio(generation_id) is False
    with pytest.raises(asyncio.CancelledError):
        await task


@pytest.mark.asyncio
async def test_duplicate_interrupt_is_idempotent():
    controller = SpeechController()
    generation_id = await controller.begin_ai_speech()

    first = await controller.interrupt()
    second = await controller.interrupt()

    assert first.interrupted is True
    assert first.generation_id == generation_id
    assert second.interrupted is False
    assert second.generation_id is None
    assert second.state == SpeechState.USER_SPEAKING


@pytest.mark.asyncio
async def test_racing_interruptions_only_cancel_once():
    controller = SpeechController()
    await controller.begin_ai_speech()

    results = await asyncio.gather(*(controller.interrupt() for _ in range(8)))

    assert sum(result.interrupted for result in results) == 1
    assert controller.state == SpeechState.USER_SPEAKING


@pytest.mark.asyncio
async def test_late_generation_cannot_finish_or_emit_audio():
    controller = SpeechController()
    old_generation = await controller.begin_ai_speech()
    await controller.interrupt()
    new_generation = await controller.begin_ai_speech()

    assert old_generation != new_generation
    assert await controller.finish(old_generation) is False
    assert await controller.accepts_audio(old_generation) is False
    assert await controller.accepts_audio(new_generation) is True


@pytest.mark.asyncio
async def test_completed_task_clears_generation_automatically():
    controller = SpeechController()
    task = asyncio.create_task(asyncio.sleep(0))
    generation_id = await controller.begin_ai_speech(task)
    await task
    await asyncio.sleep(0)

    assert await controller.finish(generation_id) is False
    assert controller.active_generation is None
    assert controller.state == SpeechState.IDLE


@pytest.mark.asyncio
async def test_close_cancels_active_speech():
    controller = SpeechController()
    task = asyncio.create_task(pending_speech())
    await controller.begin_ai_speech(task)

    await controller.close()

    assert controller.state == SpeechState.IDLE
    with pytest.raises(asyncio.CancelledError):
        await task

from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import LearningEvent, Participant, Satisfaction, Session
from ..schemas import EventIn, SatisfactionIn, SessionCompleteIn, SessionCreate, SessionOut


router = APIRouter(tags=["sessions"])


@router.post("/sessions", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    if len(payload.participants) != payload.participant_count:
        raise HTTPException(status_code=422, detail="participant_count must match participants length")

    item = Session(
        session_code=payload.session_code,
        scenario_code=payload.scenario_code,
        scenario_version=payload.scenario_version,
        mode=payload.mode,
        performance_unit=payload.performance_unit,
        participant_count=payload.participant_count,
    )
    item.participants = [
        Participant(
            member_no=p.member_no,
            profession=p.profession,
            role=p.role,
        )
        for p in payload.participants
    ]
    db.add(item)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        existing = await db.scalar(select(Session).where(Session.session_code == payload.session_code))
        if existing:
            return existing
        raise
    await db.refresh(item)
    return item


@router.post("/sessions/{session_id}/events", status_code=status.HTTP_201_CREATED)
async def create_event(
    session_id: uuid.UUID,
    payload: EventIn,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    event = LearningEvent(
        session_id=session_id,
        event_type=payload.event_type,
        step=payload.step,
        question_id=payload.question_id,
        selected_option=payload.selected_option,
        is_correct=payload.is_correct,
        attempt_number=payload.attempt_number,
        elapsed_ms=payload.elapsed_ms,
    )
    db.add(event)
    await db.commit()
    return {"id": str(event.id), "status": "recorded"}


@router.post("/sessions/{session_id}/complete")
async def complete_session(
    session_id: uuid.UUID,
    payload: SessionCompleteIn,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    session.completed = True
    session.completed_at = datetime.utcnow()
    session.total_score = payload.total_score
    if payload.duration_seconds is not None:
        session.duration_seconds = payload.duration_seconds
    elif session.started_at:
        session.duration_seconds = int((session.completed_at - session.started_at).total_seconds())

    await db.commit()
    return {"status": "completed", "session_id": str(session_id)}


@router.post("/sessions/{session_id}/satisfaction", status_code=status.HTTP_201_CREATED)
async def save_satisfaction(
    session_id: uuid.UUID,
    payload: SatisfactionIn,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    if any(v < 1 or v > 5 for v in payload.answers):
        raise HTTPException(status_code=422, detail="each satisfaction answer must be 1-5")

    existing = await db.scalar(select(Satisfaction).where(Satisfaction.session_id == session_id))
    avg = round(sum(payload.answers) / 5, 2)

    if existing:
        existing.q1, existing.q2, existing.q3, existing.q4, existing.q5 = payload.answers
        existing.average = avg
        existing.submitted_at = datetime.utcnow()
    else:
        existing = Satisfaction(
            session_id=session_id,
            q1=payload.answers[0],
            q2=payload.answers[1],
            q3=payload.answers[2],
            q4=payload.answers[3],
            q5=payload.answers[4],
            average=avg,
        )
        db.add(existing)

    await db.commit()
    return {"status": "saved", "average": avg}

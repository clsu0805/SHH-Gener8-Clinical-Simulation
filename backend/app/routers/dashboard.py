from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, distinct, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import LearningEvent, Participant, Satisfaction, Session
from ..schemas import DashboardSummary, SessionRow


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def apply_period(stmt, year: int | None, month: int | None):
    if year:
        stmt = stmt.where(extract("year", Session.started_at) == year)
    if month:
        stmt = stmt.where(extract("month", Session.started_at) == month)
    return stmt


@router.get("/summary", response_model=DashboardSummary)
async def summary(
    year: int | None = Query(default=None, ge=2020, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    scenario: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    base = select(Session)
    if year:
        base = base.where(extract("year", Session.started_at) == year)
    if month:
        base = base.where(extract("month", Session.started_at) == month)
    if scenario:
        base = base.where(Session.scenario_code == scenario)

    sessions = (await db.scalars(base)).all()
    session_ids = [s.id for s in sessions]
    session_count = len(sessions)
    participant_count = sum(s.participant_count for s in sessions)

    if not session_ids:
        return DashboardSummary(
            participant_count=0,
            session_count=0,
            profession_count=0,
            average_score=None,
            average_duration_seconds=None,
            completion_rate=None,
            average_satisfaction=None,
        )

    profession_count = await db.scalar(
        select(func.count(distinct(Participant.profession))).where(Participant.session_id.in_(session_ids))
    )
    average_satisfaction = await db.scalar(
        select(func.avg(Satisfaction.average)).where(Satisfaction.session_id.in_(session_ids))
    )

    scores = [s.total_score for s in sessions if s.total_score is not None]
    durations = [s.duration_seconds for s in sessions if s.duration_seconds is not None]
    completed_count = sum(1 for s in sessions if s.completed)

    return DashboardSummary(
        participant_count=participant_count,
        session_count=session_count,
        profession_count=int(profession_count or 0),
        average_score=round(sum(scores) / len(scores), 2) if scores else None,
        average_duration_seconds=round(sum(durations) / len(durations), 2) if durations else None,
        completion_rate=round((completed_count / session_count) * 100, 2) if session_count else None,
        average_satisfaction=round(float(average_satisfaction), 2) if average_satisfaction is not None else None,
    )


@router.get("/sessions", response_model=list[SessionRow])
async def session_rows(
    year: int | None = Query(default=None, ge=2020, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    scenario: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Session, Satisfaction.average)
        .outerjoin(Satisfaction, Satisfaction.session_id == Session.id)
        .order_by(Session.started_at.desc())
    )
    if year:
        stmt = stmt.where(extract("year", Session.started_at) == year)
    if month:
        stmt = stmt.where(extract("month", Session.started_at) == month)
    if scenario:
        stmt = stmt.where(Session.scenario_code == scenario)

    rows = (await db.execute(stmt)).all()
    return [
        SessionRow(
            id=s.id,
            session_code=s.session_code,
            scenario_code=s.scenario_code,
            scenario_version=s.scenario_version,
            participant_count=s.participant_count,
            started_at=s.started_at,
            completed_at=s.completed_at,
            duration_seconds=s.duration_seconds,
            total_score=s.total_score,
            satisfaction_average=sat,
        )
        for s, sat in rows
    ]


@router.get("/question-stats")
async def question_stats(
    year: int | None = Query(default=None, ge=2020, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    scenario: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            LearningEvent.question_id,
            func.count(LearningEvent.id).label("attempts"),
            func.sum(case((LearningEvent.is_correct.is_(True), 1), else_=0)).label("correct_attempts"),
        )
        .join(Session, Session.id == LearningEvent.session_id)
        .where(LearningEvent.question_id.is_not(None))
        .group_by(LearningEvent.question_id)
        .order_by(LearningEvent.question_id)
    )
    if year:
        stmt = stmt.where(extract("year", Session.started_at) == year)
    if month:
        stmt = stmt.where(extract("month", Session.started_at) == month)
    if scenario:
        stmt = stmt.where(Session.scenario_code == scenario)

    rows = (await db.execute(stmt)).all()
    return [
        {
            "question_id": q,
            "attempts": int(attempts or 0),
            "correct_attempts": int(correct or 0),
            "pass_rate": round((int(correct or 0) / int(attempts or 1)) * 100, 2),
        }
        for q, attempts, correct in rows
    ]

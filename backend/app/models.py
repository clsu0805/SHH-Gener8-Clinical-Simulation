import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    version: Mapped[str] = mapped_column(String(30), default="v1.0")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    scenario_code: Mapped[str] = mapped_column(String(50), index=True, default="AECOPD")
    scenario_version: Mapped[str] = mapped_column(String(30), default="v1.0")
    mode: Mapped[str] = mapped_column(String(30), default="team")
    performance_unit: Mapped[str] = mapped_column(String(30), default="team")
    participant_count: Mapped[int] = mapped_column(Integer)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    participants: Mapped[list["Participant"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    events: Mapped[list["LearningEvent"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    satisfaction: Mapped["Satisfaction | None"] = relationship(back_populates="session", cascade="all, delete-orphan", uselist=False)


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (UniqueConstraint("session_id", "member_no", name="uq_session_member"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    member_no: Mapped[int] = mapped_column(Integer)
    profession: Mapped[str] = mapped_column(String(50), index=True)
    role: Mapped[str] = mapped_column(String(50), index=True)

    session: Mapped["Session"] = relationship(back_populates="participants")


class LearningEvent(Base):
    __tablename__ = "learning_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(40), default="answer", index=True)
    step: Mapped[str] = mapped_column(String(80), index=True)
    question_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    selected_option: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    attempt_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elapsed_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)

    session: Mapped["Session"] = relationship(back_populates="events")


class Satisfaction(Base):
    __tablename__ = "satisfaction"
    __table_args__ = (UniqueConstraint("session_id", name="uq_satisfaction_session"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    q1: Mapped[int] = mapped_column(Integer)
    q2: Mapped[int] = mapped_column(Integer)
    q3: Mapped[int] = mapped_column(Integer)
    q4: Mapped[int] = mapped_column(Integer)
    q5: Mapped[int] = mapped_column(Integer)
    average: Mapped[float] = mapped_column(Float)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    session: Mapped["Session"] = relationship(back_populates="satisfaction")

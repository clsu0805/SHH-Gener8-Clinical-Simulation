import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ParticipantIn(BaseModel):
    member_no: int = Field(ge=1, le=20)
    profession: str = Field(min_length=1, max_length=50)
    role: str = Field(min_length=1, max_length=50)


class SessionCreate(BaseModel):
    session_code: str = Field(min_length=3, max_length=100)
    scenario_code: str = "AECOPD"
    scenario_version: str = "v1.0"
    mode: str = "team"
    performance_unit: str = "team"
    participant_count: int = Field(ge=1, le=20)
    participants: list[ParticipantIn]


class SessionOut(BaseModel):
    id: uuid.UUID
    session_code: str
    scenario_code: str
    scenario_version: str
    participant_count: int
    started_at: datetime
    completed: bool

    model_config = {"from_attributes": True}


class EventIn(BaseModel):
    event_type: str = "answer"
    step: str
    question_id: str | None = None
    selected_option: str | None = None
    is_correct: bool | None = None
    attempt_number: int | None = Field(default=None, ge=1)
    elapsed_ms: int | None = Field(default=None, ge=0)


class SessionCompleteIn(BaseModel):
    total_score: float | None = Field(default=None, ge=0, le=100)
    duration_seconds: int | None = Field(default=None, ge=0)


class SatisfactionIn(BaseModel):
    answers: list[int] = Field(min_length=5, max_length=5)


class DashboardSummary(BaseModel):
    participant_count: int
    session_count: int
    profession_count: int
    average_score: float | None
    average_duration_seconds: float | None
    completion_rate: float | None
    average_satisfaction: float | None


class SessionRow(BaseModel):
    id: uuid.UUID
    session_code: str
    scenario_code: str
    scenario_version: str
    participant_count: int
    started_at: datetime
    completed_at: datetime | None
    duration_seconds: int | None
    total_score: float | None
    satisfaction_average: float | None

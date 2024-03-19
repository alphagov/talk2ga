from datetime import datetime
import sqlalchemy as sa
import pytz
from sqlmodel import Field, SQLModel
import uuid


class QuestionBase(SQLModel):
    text: str
    succeeded: bool | None = None
    error_msg: str | None = None
    logs_json: str | None = None
    final_output: str | None = None
    duration: int | None = None
    username: str | None = None
    user_email: str | None = None
    has_feedback: bool | None = None
    is_feedback_positive: bool | None = None
    feedback_text: str | None = None
    suggested_sql_correction: str | None = None
    explanations: str | None = None


class Question(QuestionBase, table=True):
    id: str = Field(primary_key=True, default_factory=lambda : str(uuid.uuid4()))
    created_at: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True)), default_factory=lambda : datetime.now(pytz.timezone('Europe/London')))


class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(SQLModel):
    succeeded: bool | None = None
    error_msg: str | None = None
    logs_json: str | None = None
    final_output: str | None = None
    duration: int | None = None
    username: str | None = None
    user_email: str | None = None
    has_feedback: bool | None = None
    is_feedback_positive: bool | None = None
    feedback_text: str | None = None
    suggested_sql_correction: str | None = None
    explanations: str | None = None

class QuestionRead(QuestionBase):
    id: str
    created_at: datetime
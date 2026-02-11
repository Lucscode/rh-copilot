import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Float, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from enum import Enum as PyEnum


def _uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, PyEnum):
    CANDIDATO = "candidato"
    RH = "rh"
    FUNCIONARIO = "funcionario"
    ADMIN = "admin"


class ApplicationStatus(str, PyEnum):
    APLICADO = "aplicado"
    EM_ANALISE = "em_analise"
    ENTREVISTA = "entrevista"
    OFERECIDO = "oferecido"
    REJEITADO = "rejeitado"


class InterviewStatus(str, PyEnum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class NotificationType(str, PyEnum):
    NEW_APPLICATION = "new_application"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    APPLICATION_REJECTED = "application_rejected"
    STATUS_CHANGED = "status_changed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.CANDIDATO, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    jobs: Mapped[list["Job"]] = relationship(back_populates="creator")
    interviews: Mapped[list["Interview"]] = relationship(back_populates="interviewer")
    notes: Mapped[list["InterviewNote"]] = relationship(back_populates="author")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    full_description: Mapped[str] = mapped_column(Text, nullable=True)

    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    creator: Mapped["User"] = relationship(back_populates="jobs")
    applications: Mapped[list["Application"]] = relationship(back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    resume_text: Mapped[str] = mapped_column(Text, nullable=False)
    cv_url: Mapped[str] = mapped_column(String(500), nullable=True)  # URL ou caminho do CV
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    applications: Mapped[list["Application"]] = relationship(back_populates="candidate")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(10), default="blue")  # ex: "blue", "green", "red"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False)
    candidate_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidates.id"), nullable=False)

    status: Mapped[str] = mapped_column(SQLEnum(ApplicationStatus), default=ApplicationStatus.APLICADO, nullable=False)
    match_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    tags: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array como string: ["tag1", "tag2"]
    internal_notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    job: Mapped["Job"] = relationship(back_populates="applications")
    candidate: Mapped["Candidate"] = relationship(back_populates="applications")
    interviews: Mapped[list["Interview"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    notes: Mapped[list["InterviewNote"]] = relationship(back_populates="application", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), nullable=False)
    interviewer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    type: Mapped[str] = mapped_column(String(50), nullable=True)  # "phone", "video", "in-person"
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    application: Mapped["Application"] = relationship(back_populates="interviews")
    interviewer: Mapped["User"] = relationship(back_populates="interviews")


class InterviewNote(Base):
    __tablename__ = "interview_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("applications.id"), nullable=False)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(Boolean, default=True)  # Só RH vê

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    application: Mapped["Application"] = relationship(back_populates="notes")
    author: Mapped["User"] = relationship(back_populates="notes")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    type: Mapped[str] = mapped_column(SQLEnum(NotificationType))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text)
    link: Mapped[str] = mapped_column(String(500), nullable=True)  # ex: "/job/123/application/456"

    read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="notifications")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

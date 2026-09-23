import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Enum
import enum

from .database import Base


class ComplaintCategory(str, enum.Enum):
    teaching = "Lecturers & Teaching"
    facilities = "Facilities"
    registration = "Course Registration"
    welfare = "Harassment & Welfare"
    exams = "Exams & Grading"
    other = "Other"


class ComplaintStatus(str, enum.Enum):
    new = "New"
    in_review = "In review"
    resolved = "Resolved"


def make_tracking_code() -> str:
    # Short, human-typeable code the student can use to look up their
    # complaint later. Not linked to any identity.
    return uuid.uuid4().hex[:8].upper()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_code = Column(String, unique=True, index=True, default=make_tracking_code)

    department = Column(String, nullable=False)
    category = Column(Enum(ComplaintCategory), nullable=False)
    message = Column(Text, nullable=False)

    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.new, nullable=False)
    admin_note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

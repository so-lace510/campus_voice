from datetime import datetime
from typing import Optional, List, Dict

from pydantic import BaseModel, Field

from .models import ComplaintCategory, ComplaintStatus


class ComplaintCreate(BaseModel):
    department: str = Field(..., min_length=2, max_length=120)
    category: ComplaintCategory
    message: str = Field(..., min_length=10, max_length=4000)


class ComplaintCreated(BaseModel):
    tracking_code: str
    created_at: datetime


class ComplaintStatusLookup(BaseModel):
    tracking_code: str
    status: ComplaintStatus
    admin_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ComplaintOut(BaseModel):
    id: str
    tracking_code: str
    department: str
    category: ComplaintCategory
    message: str
    status: ComplaintStatus
    admin_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    admin_note: Optional[str] = Field(None, max_length=2000)


class AdminLogin(BaseModel):
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CategoryCount(BaseModel):
    category: str
    count: int


class DepartmentCount(BaseModel):
    department: str
    count: int


class TrendPoint(BaseModel):
    date: str
    count: int


class AnalyticsOut(BaseModel):
    total_complaints: int
    new_count: int
    in_review_count: int
    resolved_count: int
    by_category: List[CategoryCount]
    by_department: List[DepartmentCount]
    trend: List[TrendPoint]
    top_keywords: List[Dict[str, object]]
    recommendations: List[str]

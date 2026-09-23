from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


@router.post("", response_model=schemas.ComplaintCreated, status_code=201)
def submit_complaint(payload: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    """Anonymous complaint submission. No IP, name, or account is stored —
    only the department, category and message text."""
    complaint = models.Complaint(
        department=payload.department.strip(),
        category=payload.category,
        message=payload.message.strip(),
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return schemas.ComplaintCreated(
        tracking_code=complaint.tracking_code,
        created_at=complaint.created_at,
    )


@router.get("/track/{tracking_code}", response_model=schemas.ComplaintStatusLookup)
def track_complaint(tracking_code: str, db: Session = Depends(get_db)):
    """Lets a student check the status of their own complaint using the
    tracking code they were given at submission time — no login needed."""
    complaint = (
        db.query(models.Complaint)
        .filter(models.Complaint.tracking_code == tracking_code.strip().upper())
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=404, detail="No complaint found with that tracking code.")
    return schemas.ComplaintStatusLookup(
        tracking_code=complaint.tracking_code,
        status=complaint.status,
        admin_note=complaint.admin_note,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
    )


@router.get("/categories")
def list_categories():
    return [c.value for c in models.ComplaintCategory]

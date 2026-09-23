import re
from collections import Counter
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import check_admin_password, create_access_token, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

STOPWORDS = {
    "the", "and", "a", "an", "to", "of", "in", "is", "it", "for", "on", "was",
    "are", "this", "that", "with", "as", "at", "be", "we", "our", "i", "my",
    "they", "them", "he", "she", "us", "but", "so", "not", "have", "has",
    "had", "there", "their", "you", "your", "or", "if", "when", "because",
    "been", "were", "will", "would", "should", "could", "than", "then",
    "also", "very", "about", "into", "from", "by", "no", "do", "does",
    "did", "just", "some", "all", "more", "most", "can", "much", "many",
}


@router.post("/login", response_model=schemas.TokenOut)
def admin_login(payload: schemas.AdminLogin):
    if not check_admin_password(payload.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    return schemas.TokenOut(access_token=create_access_token())


@router.get(
    "/complaints",
    response_model=list[schemas.ComplaintOut],
    dependencies=[Depends(require_admin)],
)
def list_complaints(
    db: Session = Depends(get_db),
    status: Optional[models.ComplaintStatus] = None,
    category: Optional[models.ComplaintCategory] = None,
    search: Optional[str] = None,
    limit: int = Query(200, le=500),
):
    q = db.query(models.Complaint)
    if status:
        q = q.filter(models.Complaint.status == status)
    if category:
        q = q.filter(models.Complaint.category == category)
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(models.Complaint.message.ilike(like))
    return q.order_by(models.Complaint.created_at.desc()).limit(limit).all()


@router.patch(
    "/complaints/{complaint_id}",
    response_model=schemas.ComplaintOut,
    dependencies=[Depends(require_admin)],
)
def update_complaint(complaint_id: str, payload: schemas.ComplaintStatusUpdate, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    complaint.status = payload.status
    if payload.admin_note is not None:
        complaint.admin_note = payload.admin_note
    db.commit()
    db.refresh(complaint)
    return complaint


def _build_recommendations(by_category: list[schemas.CategoryCount], total: int) -> list[str]:
    if total == 0:
        return ["No complaints yet — recommendations will appear once students start submitting."]

    recs = []
    lead = max(by_category, key=lambda c: c.count) if by_category else None
    if lead and lead.count / total >= 0.3:
        recs.append(
            f"\"{lead.category}\" makes up {round(lead.count / total * 100)}% of all complaints — "
            "prioritize this area for the next faculty board review."
        )
    for c in by_category:
        share = c.count / total
        if c.category == models.ComplaintCategory.welfare.value and c.count > 0:
            recs.append(
                "Welfare and harassment complaints need a direct, confidential escalation "
                "path to student affairs, regardless of volume."
            )
        if c.category == models.ComplaintCategory.exams.value and share >= 0.2:
            recs.append(
                "A notable share of complaints concern exams and grading — consider a "
                "transparent grade-appeal process communicated at the start of term."
            )
        if c.category == models.ComplaintCategory.facilities.value and share >= 0.2:
            recs.append(
                "Facilities complaints are significant — an audit of classrooms/labs with a "
                "public repair-tracker could rebuild trust quickly."
            )
    if not recs:
        recs.append("Complaint volume is currently low and spread across categories — keep monitoring weekly.")
    return recs[:5]


@router.get("/analytics", response_model=schemas.AnalyticsOut, dependencies=[Depends(require_admin)])
def analytics(db: Session = Depends(get_db)):
    total = db.query(models.Complaint).count()

    def count_status(s):
        return db.query(models.Complaint).filter(models.Complaint.status == s).count()

    by_category_rows = (
        db.query(models.Complaint.category, func.count(models.Complaint.id))
        .group_by(models.Complaint.category)
        .all()
    )
    by_category = sorted(
        [schemas.CategoryCount(category=c.value, count=n) for c, n in by_category_rows],
        key=lambda x: x.count,
        reverse=True,
    )

    by_department_rows = (
        db.query(models.Complaint.department, func.count(models.Complaint.id))
        .group_by(models.Complaint.department)
        .order_by(func.count(models.Complaint.id).desc())
        .limit(10)
        .all()
    )
    by_department = [schemas.DepartmentCount(department=d, count=n) for d, n in by_department_rows]

    since = datetime.utcnow() - timedelta(days=29)
    recent = db.query(models.Complaint).filter(models.Complaint.created_at >= since).all()
    day_counts = Counter(c.created_at.date().isoformat() for c in recent)
    trend = []
    for i in range(29, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).date().isoformat()
        trend.append(schemas.TrendPoint(date=day, count=day_counts.get(day, 0)))

    all_messages = db.query(models.Complaint.message).all()
    words = Counter()
    for (msg,) in all_messages:
        tokens = re.findall(r"[a-zA-Z']{4,}", msg.lower())
        words.update(w for w in tokens if w not in STOPWORDS)
    top_keywords = [{"word": w, "count": n} for w, n in words.most_common(12)]

    recommendations = _build_recommendations(by_category, total)

    return schemas.AnalyticsOut(
        total_complaints=total,
        new_count=count_status(models.ComplaintStatus.new),
        in_review_count=count_status(models.ComplaintStatus.in_review),
        resolved_count=count_status(models.ComplaintStatus.resolved),
        by_category=by_category,
        by_department=by_department,
        trend=trend,
        top_keywords=top_keywords,
        recommendations=recommendations,
    )

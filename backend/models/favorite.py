# backend/models/favorite.py
from datetime import datetime
from models.base import db

class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    syllabus_id = db.Column(db.Integer, db.ForeignKey("syllabi.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # optional relationship helpers (not strictly required)
    user = db.relationship("User", backref=db.backref("favorites", cascade="all, delete-orphan"))
    syllabus = db.relationship("Syllabus", backref=db.backref("favorited_by", cascade="all, delete-orphan"))

    __table_args__ = (
        db.UniqueConstraint("user_id", "syllabus_id", name="uix_user_syllabus"),
    )
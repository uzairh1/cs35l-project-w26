from models.base import db
from datetime import datetime


class Syllabus(db.Model):
    __tablename__ = "syllabi"

    id = db.Column(db.Integer, primary_key=True)

    file_path = db.Column(db.String, nullable=False)
    quarter = db.Column(db.String, nullable=False)
    year = db.Column(db.Integer, nullable=False)

    download_count = db.Column(db.Integer, default=0)
    favorite_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    uploader_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    course = db.relationship("Course", backref="syllabi")
    uploader = db.relationship("User", backref="uploaded_syllabi")

    
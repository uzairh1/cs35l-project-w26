from models.base import db

class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)

    department = db.Column(db.String, nullable=False)
    course_number = db.Column(db.String, nullable=False)
    course_title = db.Column(db.String, nullable=False)
    professor_first_name = db.Column(db.String, nullable=False)
    professor_last_name = db.Column(db.String, nullable=False)
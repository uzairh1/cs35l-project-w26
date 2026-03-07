from flask import Blueprint, request, jsonify
from app.jwt_utils import jwt_required

from sqlalchemy.exc import IntegrityError
from models.grades import Grade
from models.course import Course
from models.base import db

grade_api = Blueprint("grade_api", __name__)


@grade_api.route("/api/grades", methods=["POST"])
@jwt_required
def submit_grade():
    data = request.get_json(silent=True) or {}
    course_id = data.get("course_id")
    grade_val = data.get("grade")

    if course_id is None or grade_val is None:
        return jsonify({"error": "course_id and grade are required"}), 400

    try:
        grade_val = float(grade_val)
    except (ValueError, TypeError):
        return jsonify({"error": "grade must be a number"}), 400

    if not (0.0 <= grade_val <= 4.0):
        return jsonify({"error": "grade must be between 0.0 and 4.0"}), 400

    # validate course exists
    try:
        course_id = int(course_id)
    except (ValueError, TypeError):
        return jsonify({"error": "course_id must be an integer"}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 400

    user_id = getattr(request, "user", None)
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 401

    existing_grade = Grade.query.filter_by(user_id=user_id, course_id=course_id).first()
    if existing_grade:
        existing_grade.grade = grade_val
        db.session.commit()
        return jsonify({"message": "Grade updated successfully", "grade_id": existing_grade.id}), 200
    else:
        new_grade = Grade(user_id=user_id, course_id=course_id, grade=grade_val)
        db.session.add(new_grade)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Grade submission failed (conflict)"}), 409
        return jsonify({"message": "Grade submitted successfully", "grade_id": new_grade.id}), 201
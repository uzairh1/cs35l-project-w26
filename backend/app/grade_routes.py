from flask import Blueprint, request, jsonify
from app.jwt_utils import jwt_required

from sqlalchemy.exc import IntegrityError
from models.grades import Grade
from models.course import Course
from models.base import db

from sqlalchemy import func
from models.grades import Grade

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
    
    

@grade_api.route("/api/courses/<int:course_id>/grade-distribution", methods=["GET"])
def course_grade_distribution(course_id):
    # validate course exists
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    # Basic aggregates
    total_count = db.session.query(func.count(Grade.id)).filter(Grade.course_id == course_id).scalar() or 0
    avg_grade = db.session.query(func.avg(Grade.grade)).filter(Grade.course_id == course_id).scalar()
    avg_grade = float(avg_grade) if avg_grade is not None else None

    # Bucket the grades into numeric ranges (A/B/C/D/F) or custom bins
    # Example numeric scale: A: >=3.7, A-:3.3-3.7, B+:3.0-3.3, B:2.7-3.0 (you can tune)
    
        # UCLA +/- GPA Buckets
    UCLA_BUCKETS = [
        ("A+/A", 4.0),  # A+ and A are both 4.0
        ("A-", 3.7),
        ("B+", 3.3),
        ("B", 3.0),
        ("B-", 2.7),
        ("C+", 2.3),
        ("C", 2.0),
        ("C-", 1.7),
        ("D+", 1.3),
        ("D", 1.0),
        ("D-", 0.7),
        ("F", 0.0),
    ]

    buckets = {label: 0 for label, _ in UCLA_BUCKETS}

        # Fetch grades and bucket them
    grades = (
        db.session.query(Grade.grade)
        .filter(Grade.course_id == course_id)
        .all()
    )

    for (g,) in grades:
        if g is None:
            continue

        for label, threshold in UCLA_BUCKETS:
            if g >= threshold:
                buckets[label] += 1
                break

    # Calculate percentages (nice for frontend charts)
    percentages = {}
    if total_count > 0:
        for label in buckets:
            percentages[label] = round((buckets[label] / total_count) * 100, 2)
    else:
        percentages = {label: 0 for label in buckets}

    # Return structured response
    return jsonify({
        "course_id": course_id,
        "course": {
            "department": course.department,
            "course_number": course.course_number,
            "course_title": course.course_title,
        },
        "count": total_count,
        "average_gpa": round(avg_grade, 3) if avg_grade is not None else None,
        "distribution": buckets,
        "percentages": percentages,
        "note": "A+ and A both count as 4.0 on the UCLA GPA scale."
    }), 200
from flask import Blueprint, request, jsonify
from app.file_utils import save_pdf
from app.jwt_utils import jwt_required
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from models.syllabus import Syllabus
from models.course import Course
from models.grades import Grade
from models.base import db
import hashlib


api = Blueprint("api", __name__)

VALID_QUARTERS = {"Fall", "Winter", "Spring", "Summer"}
VALID_SORT_OPTIONS = {"newest", "oldest", "downloads_desc", "downloads_asc"}


@api.route("/api/health")
def health():
    return {"status": "ok"}


@api.route("/api/syllabi", methods=["GET"])
def get_syllabi():
    # --- Read query params ---
    professor_last_name = request.args.get("professor_last_name", "").strip()
    department         = request.args.get("department", "").strip()
    course_number      = request.args.get("course_number", "").strip()
    quarter            = request.args.get("quarter", "").strip()
    year               = request.args.get("year", "").strip()
    sort               = request.args.get("sort", "newest").strip()

    # --- Validate params ---
    if quarter and quarter not in VALID_QUARTERS:
        return jsonify({
            "error": f"Invalid quarter '{quarter}'. Must be one of: {', '.join(sorted(VALID_QUARTERS))}"
        }), 400

    if year:
        if not year.isdigit() or not (1900 <= int(year) <= 2100):
            return jsonify({"error": "year must be a valid 4-digit number (e.g. 2024)"}), 400
        year = int(year)

    if sort not in VALID_SORT_OPTIONS:
        return jsonify({
            "error": f"Invalid sort '{sort}'. Must be one of: {', '.join(sorted(VALID_SORT_OPTIONS))}"
        }), 400

    # --- Build query with JOIN on Course ---
    query = (
        Syllabus.query
        .join(Syllabus.course)
        .options(joinedload(Syllabus.course), joinedload(Syllabus.uploader))
    )

    # --- Apply filters (all case-insensitive, ORM only — no raw SQL) ---
    if professor_last_name:
        query = query.filter(
            func.lower(Course.professor_last_name).contains(professor_last_name.lower())
        )

    if department:
        query = query.filter(
            func.lower(Course.department).contains(department.lower())
        )

    if course_number:
        query = query.filter(
            func.lower(Course.course_number).contains(course_number.lower())
        )

    if quarter:
        query = query.filter(
            func.lower(Syllabus.quarter) == quarter.lower()
        )

    if year:
        query = query.filter(Syllabus.year == year)

    # --- Apply sorting ---
    if sort == "newest":
        query = query.order_by(Syllabus.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(Syllabus.created_at.asc())
    elif sort == "downloads_desc":
        query = query.order_by(Syllabus.download_count.desc())
    elif sort == "downloads_asc":
        query = query.order_by(Syllabus.download_count.asc())

    syllabi = query.all()

    # --- Serialize results ---
    results = []
    for s in syllabi:
        results.append({
            "id": s.id,
            "quarter": s.quarter,
            "year": s.year,
            "download_count": s.download_count,
            "favorite_count": s.favorite_count,
            "created_at": s.created_at.isoformat(),
            "course": {
                "id": s.course_id,
                "department": s.course.department,
                "course_number": s.course.course_number,
                "course_title": s.course.course_title,
                "professor_first_name": s.course.professor_first_name,
                "professor_last_name": s.course.professor_last_name,
            },
            "uploader": None if not s.uploader else {
                "id": s.uploader_id,
                "email": s.uploader.email,
            }
        })

    return jsonify(results), 200


@api.route("/api/syllabi/<int:syllabus_id>", methods=["GET"])
def get_syllabus(syllabus_id):
    syllabus = (
        Syllabus.query
        .options(joinedload(Syllabus.course), joinedload(Syllabus.uploader))
        .filter_by(id=syllabus_id)
        .first()
    )

    if not syllabus:
        return jsonify({"error": "Syllabus not found"}), 404
    
    response = {
       "id": syllabus.id,
       "quarter": syllabus.quarter,
       "year": syllabus.year,
       "download_count": syllabus.download_count,
       "favorite_count": syllabus.favorite_count,
       "created_at": syllabus.created_at.isoformat(),

       "course": {
        "id": syllabus.course_id,
        "department": syllabus.course.department,
        "course_number": syllabus.course.course_number,
        "course_title": syllabus.course.course_title,
        "professor_first_name": syllabus.course.professor_first_name,
        "professor_last_name": syllabus.course.professor_last_name,
       },
        "uploader": None if not syllabus.uploader else {
            "id": syllabus.uploader_id,
            "email": syllabus.uploader.email
        }
    }
    
    return jsonify(response), 200

@api.route("/api/protected") # Just for testing auth, can remove later
@jwt_required
def protected():
    user = getattr(request, "user", None)
    return jsonify({"message": f"You are logged in as {user}"})

@api.route("/api/upload", methods=["POST"])

@jwt_required
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]

    course_id = request.form.get("course_id")
    quarter = request.form.get("quarter")
    year = request.form.get("year")

    if not course_id or not quarter or not year:
        return jsonify({"error": "Missing required fields"}), 400

    # Validate numeric fields
    try:
        course_id = int(course_id)
    except (ValueError, TypeError):
        return jsonify({"error": "course_id must be an integer"}), 400

    try:
        year = int(year)
    except (ValueError, TypeError):
        return jsonify({"error": "year must be an integer"}), 400
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 400
    
    file_bytes = file.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    file.seek(0)

    dup = Syllabus.query.filter_by(file_hash=file_hash, course_id=course_id, quarter=quarter, year=year).first()
    if dup:
        return jsonify({
            "error": "Duplicate upload detected",
            "message": "A syllabus with identical content already exists",
            "existing_syllabus_id": dup.id
            }), 409

    try:
        filename = save_pdf(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Upload failed"}), 500
    
    user_id = getattr(request, "user", None)

    from models.user import User
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 401
    
    new_syllabus = Syllabus(
        file_path=filename,
        file_hash=file_hash,
        quarter=quarter,
        year=int(year),
        course_id=int(course_id),
        uploader_id=user.id
    )

    db.session.add(new_syllabus)
    db.session.commit()

    return jsonify(
        {"message": "File uploaded successfully",
        "original_filename": file.filename
        , "stored_filename": filename,
        "syllabus_id": new_syllabus.id}
        ), 201

@api.route("/api/grades", methods=["POST"])
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
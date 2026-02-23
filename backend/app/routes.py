from flask import Blueprint, request, jsonify
from app.file_utils import save_pdf
from app.jwt_utils import jwt_required
from sqlalchemy.orm import joinedload
from models.syllabus import Syllabus
from models.base import db



api = Blueprint("api", __name__)

@api.route("/api/health")
def health():
    return {"status": "ok"}


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

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_syllabus = Syllabus(
        file_path=filename,
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
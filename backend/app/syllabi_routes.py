from flask import Blueprint, request, jsonify, current_app, send_file
from app.file_utils import save_pdf
from app.jwt_utils import jwt_required
from app.serializers import serialize_syllabus
from app.constants import VALID_QUARTERS, VALID_SORT_OPTIONS

from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

from models import syllabus
from models.syllabus import Syllabus
from models.course import Course
from models.user import User
from models.favorite import Favorite
from models.base import db

import hashlib
import os

syllabi_api = Blueprint("syllabi_api", __name__)



@syllabi_api.route("/api/health")
def health():
    return {"status": "ok"}


@syllabi_api.route("/api/syllabi", methods=["GET"])
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
    results = [serialize_syllabus(s) for s in syllabi]
    return jsonify(results), 200


@syllabi_api.route("/api/syllabi/<int:syllabus_id>", methods=["GET"])
def get_syllabus(syllabus_id):
    syllabus = (
        Syllabus.query
        .options(joinedload(Syllabus.course), joinedload(Syllabus.uploader))
        .filter_by(id=syllabus_id)
        .first()
    )

    if not syllabus:
        return jsonify({"error": "Syllabus not found"}), 404
    
    return jsonify(serialize_syllabus(syllabus)), 200

@syllabi_api.route("/api/upload", methods=["POST"])

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

# POST /api/syllabi/<id>/favorite
@syllabi_api.route("/api/syllabi/<int:syllabus_id>/favorite", methods=["POST"])
@jwt_required
def favorite_syllabus(syllabus_id):
    user_id = getattr(request, "user", None)
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 401

    syllabus = Syllabus.query.get(syllabus_id)
    if not syllabus:
        return jsonify({"error": "Syllabus not found"}), 404

    # Try to insert favorite; honor unique constraint to avoid duplicates
    fav = Favorite(user_id=user_id, syllabus_id=syllabus_id)
    db.session.add(fav)
    try:
        # Also increment favorite_count atomically
        syllabus.favorite_count = (syllabus.favorite_count or 0) + 1
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        # already favorited by this user
        return jsonify({"message": "Already favorited"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Failed to favorite")
        return jsonify({"error": "Failed to favorite"}), 500

    return jsonify({"message": "Favorited", "syllabus_id": syllabus_id, "favorite_count": syllabus.favorite_count}), 201


# DELETE /api/syllabi/<id>/favorite
@syllabi_api.route("/api/syllabi/<int:syllabus_id>/favorite", methods=["DELETE"])
@jwt_required
def unfavorite_syllabus(syllabus_id):
    user_id = getattr(request, "user", None)
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 401

    fav = Favorite.query.filter_by(user_id=user_id, syllabus_id=syllabus_id).first()
    if not fav:
        return jsonify({"message": "Not favorited"}), 200

    syllabus = Syllabus.query.get(syllabus_id)
    try:
        db.session.delete(fav)
        # decrement count safely but not below zero
        if syllabus:
            syllabus.favorite_count = max((syllabus.favorite_count or 0) - 1, 0)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to unfavorite")
        return jsonify({"error": "Failed to unfavorite"}), 500

    return jsonify({"message": "Unfavorited", "syllabus_id": syllabus_id, "favorite_count": syllabus.favorite_count if syllabus else None}), 200


# GET /api/favorites - list current user's favorites (serialized)
@syllabi_api.route("/api/favorites", methods=["GET"])
@jwt_required
def get_my_favorites():
    user_id = getattr(request, "user", None)
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 401

    favs = (
        Favorite.query
        .filter_by(user_id=user_id)
        .join(Syllabus, Favorite.syllabus_id == Syllabus.id)
        .options(joinedload(Favorite.syllabus).joinedload(Syllabus.course))
        .all()
    )

    syllabi = [serialize_syllabus(f.syllabus) for f in favs if f.syllabus is not None]
    return jsonify(syllabi), 200

@syllabi_api.route("/api/syllabi/<int:syllabus_id>", methods=["DELETE"])
@jwt_required
def delete_syllabus(syllabus_id):
    user_id = getattr(request, "user", None)
    if not user_id:
        return jsonify({"error": "Unauthenticated"}), 401

    syllabus = Syllabus.query.get(syllabus_id)
    if not syllabus:
        return jsonify({"error": "Syllabus not found"}), 404

    # Ownership check
    if syllabus.uploader_id != user_id:
        return jsonify({"error": "You are not authorized to delete this syllabus"}), 403

    try:
        file_path = os.path.join(current_app.config["UPLOADS_FOLDER"], syllabus.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
        db.session.delete(syllabus)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to delete syllabus"}), 500

    return jsonify({"message": "Syllabus deleted successfully"}), 200
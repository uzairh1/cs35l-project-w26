from flask import Blueprint, request, jsonify
from app.file_utils import save_pdf
from app.jwt_utils import jwt_required


api = Blueprint("api", __name__)

@api.route("/api/health")
def health():
    return {"status": "ok"}

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

    try:
        filename = save_pdf(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Upload failed"}), 500
    
    return jsonify(
        {"original_filename": file.filename
        , "stored_filename": filename}
        ), 201
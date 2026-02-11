from flask import Blueprint, jsonify, request
from .jwt_utils import jwt_required

api = Blueprint("api", __name__)

@api.route("/api/health")
def health():
    return {"status": "ok"}

@api.route("/api/protected")
@jwt_required
def protected():
    user = getattr(request, "user", None)
    return jsonify({"message": f"You are logged in as {user}"})

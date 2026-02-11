import jwt
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
auth = Blueprint("auth", __name__)

@auth.route("/api/login", methods=["POST"])

def login():
    data = request.get_json(silent=True) or {}
    # Hardcoded credentials. Replace with DB lookup.
    if data.get("username") != "admin" or data.get("password") != "password":
        return jsonify({"error": "Invalid credentials"}), 401
    
    now  = datetime.utcnow()
    expires = now + timedelta(hours=current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 1))
    payload = {
        "sub": "admin",
        "iat": now,
        "exp": expires,
    }

    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config.get("JWT_ALGORITHM", "HS256"),
    )

    return jsonify({"access_token": token})
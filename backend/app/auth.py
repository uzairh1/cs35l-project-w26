import jwt
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash

from app import db
from models.user import User

auth = Blueprint("auth", __name__)

@auth.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if password.isspace():
        return jsonify({"error": "Password can't contain only whitespace"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    if len(password) > 64:
        return jsonify({"error": "Password is too long."}), 400

    # Validate UCLA email domain
    if not (email.endswith("@ucla.edu") or email.endswith("@g.ucla.edu")):
        return jsonify({"error": "Email must be a valid @ucla.edu or @g.ucla.edu domain"}), 400

    # Check for existing user
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User with this email already exists"}), 400

    # Hash the password for secure storage
    hashed_password = generate_password_hash(password)

    # Create and save the new user
    new_user = User(email=email, password_hash=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error. Please try again."}), 500

    return jsonify({"message": "User registered successfully"}), 201


@auth.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Retrieve user from the database
    user = User.query.filter_by(email=email).first()

    # Verify user exists and password is correct
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT token with timezone-aware UTC timestamps.
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 1))

    payload = {
        "sub": str(user.id),
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }

    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config.get("JWT_ALGORITHM", "HS256"),
    )

    return jsonify({"access_token": token, "message": "Login successful"}), 200

import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    ENV = os.getenv("FLASK_ENV", "development")

    JWT_SECRET_KEY = os.getenv("JW_SECRET_KEY", "jwt-dev-secret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "1"))
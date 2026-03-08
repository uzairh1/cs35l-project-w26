import os
from sqlalchemy.engine import URL

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    ENV = os.getenv("FLASK_ENV", "development")

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "1"))

    DB_USER = os.getenv("DATABASE_USER")
    DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
    if not DB_USER or not DB_PASSWORD:
        raise ValueError("Both DATABASE_USER and DATABASE_PASSWORD must be set.")
    
    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="postgresql+psycopg",
        username=DB_USER,
        password=DB_PASSWORD,
        host="aws-0-us-west-2.pooler.supabase.com",
        port=5432, # Port for session pooler
        database="postgres",
        query={"sslmode": "require"},
    )
    
    UPLOADS_FOLDER = os.path.join(os.getcwd(), "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024 # 10 MB

    CORS_ORIGINS = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]
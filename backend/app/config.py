import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    ENV = os.getenv("FLASK_ENV", "development")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
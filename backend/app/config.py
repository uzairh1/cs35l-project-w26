import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    ENV = os.getenv("FLASK_ENV", "development")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError(
            "DATABASE_URL is not set. Set it to your Supabase Postgres connection string, e.g. " \
            "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
        )
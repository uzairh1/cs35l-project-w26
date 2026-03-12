import os
import uuid

from flask import current_app
from werkzeug.utils import secure_filename

from supabase_client import supabase

ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_pdf(file):
    if not file:
        raise ValueError("No file provided")
    if file.filename == "":
        raise ValueError("No selected file")
    if not allowed_file(file.filename):
        raise ValueError("Only PDF files are allowed")
    if file.mimetype != "application/pdf":
        raise ValueError("File is not a valid PDF")


def get_local_path(file_path):
    return os.path.join(current_app.config["UPLOADS_FOLDER"], file_path)


def _storage_bucket():
    bucket_name = current_app.config["SUPABASE_STORAGE_BUCKET"]
    return supabase.storage.from_(bucket_name)


def save_pdf(file):
    validate_pdf(file)

    filename = secure_filename(file.filename)
    storage_key = f"syllabi/{uuid.uuid4().hex}_{filename}"
    file_bytes = file.read()

    try:
        _storage_bucket().upload(
            path=storage_key,
            file=file_bytes,
            file_options={
                "content-type": "application/pdf",
                "cache-control": "3600",
                "x-upsert": "false",
            },
        )
        current_app.logger.info("Uploaded syllabus to Supabase Storage: %s", storage_key)
    except Exception:
        current_app.logger.exception("Failed to upload syllabus to Supabase Storage: %s", storage_key)
        raise

    return storage_key


def load_pdf(file_path):
    try:
        file_bytes = _storage_bucket().download(file_path)
        current_app.logger.info("Loaded syllabus from Supabase Storage: %s", file_path)
        return file_bytes
    except Exception as storage_error:
        local_path = get_local_path(file_path)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                current_app.logger.warning(
                    "Loaded syllabus from local fallback: %s",
                    file_path,
                )
                return f.read()
        current_app.logger.error("Syllabus file missing from storage and local fallback: %s", file_path)
        raise FileNotFoundError(file_path) from storage_error


def delete_pdf(file_path):
    removed_from_storage = False

    try:
        _storage_bucket().remove([file_path])
        removed_from_storage = True
    except Exception:
        removed_from_storage = False

    local_path = get_local_path(file_path)
    if os.path.exists(local_path):
        os.remove(local_path)
        return

    if not removed_from_storage:
        raise FileNotFoundError(file_path)

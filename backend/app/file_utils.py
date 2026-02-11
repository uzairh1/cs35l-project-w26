import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename):
    return ( "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS)

def save_pdf(file):
    if not file:
        raise ValueError("No file provided")
    if file.filename == "":
        raise ValueError("No selected file")
    if not allowed_file(file.filename):
        raise ValueError("Only PDF files are allowed")
    if file.mimetype != "application/pdf":
        raise ValueError("File is not a valid PDF")
    
    filename = secure_filename(file.filename)

    unique_filename = f"{uuid.uuid4().hex}_{filename}"

    save_path = os.path.join(current_app.config["UPLOADS_FOLDER"], unique_filename)

    file.save(save_path)

    return unique_filename


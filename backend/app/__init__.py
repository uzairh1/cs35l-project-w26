from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()

from models.base import db
from models.user import User
from models.course import Course
from models.syllabus import Syllabus
from models.grades import Grade
from flask_migrate import Migrate
from app.auth import auth
from app.syllabi_routes import syllabi_api
from app.grade_routes import grade_api
from app.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOADS_FOLDER"], exist_ok=True)

    db.init_app(app)
    Migrate(app, db)
    
    app.register_blueprint(syllabi_api)
    app.register_blueprint(grade_api)
    app.register_blueprint(auth)

    return app

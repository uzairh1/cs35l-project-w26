from flask import Flask
from dotenv import load_dotenv
import os
from models.base import db
from models.user import User
from models.course import Course
from models.syllabus import Syllabus
from flask_migrate import Migrate
from app.routes import api
from app.auth import auth
from app.config import Config

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOADS_FOLDER"], exist_ok=True)

    db.init_app(app)
    Migrate(app, db)

    
    app.register_blueprint(api)
    app.register_blueprint(auth)

    return app

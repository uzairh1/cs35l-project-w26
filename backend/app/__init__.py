from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    from app.routes import api
    from app.auth import auth
    app.register_blueprint(api)
    app.register_blueprint(auth)

    return app

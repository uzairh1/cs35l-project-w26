from flask import Flask
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app

app = create_app()

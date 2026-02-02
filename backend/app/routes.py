from flask import Blueprint

api = Blueprint("api", __name__)

@api.route("/api/health")
def health():
    return {"status": "ok"}

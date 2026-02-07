from models.base import db

class TestModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
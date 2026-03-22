from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Todo(db.Model):
    """Todo model for representing todo items in the database"""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert Todo instance to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        """Create Todo instance from dictionary data"""
        return Todo(
            title=data.get('title', ''),
            completed=data.get('completed', False)
        )

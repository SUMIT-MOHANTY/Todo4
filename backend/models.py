from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize SQLAlchemy
db = SQLAlchemy()

class Todo(db.Model):
    """Todo model for storing task items"""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, title, description=None, completed=False):
        """Initialize a new Todo item with validation"""
        if not title or not isinstance(title, str) or len(title) == 0:
            logger.error("Invalid title for Todo item")
            raise ValueError("Title cannot be empty")

        self.title = title
        self.description = description
        self.completed = completed

    def to_dict(self):
        """Convert Todo object to dictionary for API responses"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Todo {self.id}: {self.title}>'

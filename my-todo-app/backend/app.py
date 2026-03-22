from flask import Flask, jsonify
from flask_cors import CORS
import os
from routes.todos import todos_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todos.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Register blueprints
app.register_blueprint(todos_bp, url_prefix='/api/todos')

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Simple healthcheck endpoint
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    from models import db
    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.run(host='0.0.0.0', port=5000, debug=True)

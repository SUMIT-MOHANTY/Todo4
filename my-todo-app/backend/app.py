from flask import Flask
from flask_cors import CORS
from routes.todos import todos_bp
import os

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(todos_bp, url_prefix='/api/todos')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {"error": "Not found"}, 404

@app.errorhandler(500)
def server_error(error):
    return {"error": "Internal server error"}, 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

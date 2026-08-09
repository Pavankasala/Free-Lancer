import os
from flask import Flask
from flask_cors import CORS
import db

from routes import (
    auth_bp,
    bills_bp,
    expenditures_bp,
    cash_bp,
    advance_bp,
    balance_bp,
    shops_bp,
    sales_bp,
    reports_bp
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Initialize database and migrations on startup
db.init_db()

# Register modular feature blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(bills_bp)
app.register_blueprint(expenditures_bp)
app.register_blueprint(cash_bp)
app.register_blueprint(advance_bp)
app.register_blueprint(balance_bp)
app.register_blueprint(shops_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(reports_bp)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Modular Flask Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port)

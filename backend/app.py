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
CORS(app)

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
    print("Starting Modular Flask Backend Server on port 5000...")
    app.run(host='127.0.0.1', port=5000, debug=True)

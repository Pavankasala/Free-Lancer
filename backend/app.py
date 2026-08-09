import os
from flask import Flask, jsonify
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

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    try:
        conn = db.get_db()
        cursor = conn.cursor()
        table_name = '"user"' if db.DATABASE_URL else 'user'
        cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
        row = cursor.fetchone()
        user_count = row['count'] if hasattr(row, 'keys') else row[0]
        conn.close()

        db_type = "PostgreSQL Cloud Database" if db.DATABASE_URL else "Local SQLite Database (lemons.db)"

        return jsonify({
            'status': 'healthy',
            'success': True,
            'database': {
                'connected': True,
                'type': db_type,
                'user_count': user_count
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'success': False,
            'database': {
                'connected': False,
                'error': str(e)
            }
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Modular Flask Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port)

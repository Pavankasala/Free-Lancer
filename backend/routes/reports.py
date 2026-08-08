from flask import Blueprint, request, jsonify
from datetime import datetime
import db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/api/beat-paper', methods=['GET'])
def get_beat_paper():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory WHERE date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'reports': [dict(r) for r in rows]})

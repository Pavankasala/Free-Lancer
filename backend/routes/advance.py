from flask import Blueprint, request, jsonify
from datetime import datetime
import db

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/api/advance', methods=['GET', 'POST'])
def handle_advance():
    conn = db.get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        adv_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        amount = float(data.get('amount', 0.0) or 0.0)
        
        cursor.execute("INSERT INTO inventory (name, date, type, advance) VALUES (?, ?, 'ADVANCE', ?)", (name, adv_date, amount))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Advance added'})
        
    cursor.execute("SELECT * FROM inventory WHERE type = 'ADVANCE' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'advances': [dict(r) for r in rows]})

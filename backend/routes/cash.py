from flask import Blueprint, request, jsonify
from datetime import datetime
import db

cash_bp = Blueprint('cash', __name__)

@cash_bp.route('/api/cash-collection', methods=['GET', 'POST'])
def handle_cash_collection():
    conn = db.get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.get_json() or {}
        cash_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        amount = float(data.get('amount', 0.0) or 0.0)
        given_by = data.get('given_by', '').strip()
        
        cursor.execute("INSERT INTO cash_collection (date, amount, given_by) VALUES (?, ?, ?)", (cash_date, amount, given_by))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cash collection added'})
        
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute("SELECT * FROM cash_collection WHERE date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'cash_collections': [dict(r) for r in rows]})

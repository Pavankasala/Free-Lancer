from flask import Blueprint, request, jsonify
from datetime import datetime
import db

expenditures_bp = Blueprint('expenditures', __name__)

@expenditures_bp.route('/api/expenditures', methods=['GET', 'POST'])
def handle_expenditures():
    conn = db.get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        data = request.get_json() or {}
        exp_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        desc = data.get('description', '').strip()
        amount = float(data.get('amount', 0.0) or 0.0)
        
        cursor.execute("INSERT INTO expenditures (date, description, amount) VALUES (?, ?, ?)", (exp_date, desc, amount))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Expenditure added'})
        
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute("SELECT * FROM expenditures WHERE date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'expenditures': [dict(r) for r in rows]})

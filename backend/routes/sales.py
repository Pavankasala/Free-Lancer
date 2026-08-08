from flask import Blueprint, request, jsonify
from datetime import datetime
import db

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/api/local-sale', methods=['GET', 'POST'])
def handle_local_sale():
    conn = db.get_db()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.get_json() or {}
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        name = data.get('name', '').strip()
        bags = int(data.get('bags', 0) or 0)
        price = float(data.get('price', 0.0) or 0.0)
        cursor.execute("INSERT INTO inventory (name, no_of_bags, price, date, type, paid) VALUES (?, ?, ?, ?, 'SELL', 'YES')", (name, bags, price, date))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Local sale added'})

    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute("SELECT * FROM inventory WHERE type = 'SELL' AND date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'sales': [dict(r) for r in rows]})

@sales_bp.route('/api/sold-data', methods=['GET'])
def get_sold_data():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory WHERE type = 'SELL' AND date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'sold_data': [dict(r) for r in rows]})

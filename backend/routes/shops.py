from flask import Blueprint, request, jsonify
from datetime import datetime
import db

shops_bp = Blueprint('shops', __name__)

@shops_bp.route('/api/shops', methods=['GET', 'POST'])
def handle_shops():
    conn = db.get_db()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.get_json() or {}
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        name = data.get('name', '').strip()
        bags = int(data.get('bags', 0) or 0)
        price = float(data.get('price', 0.0) or 0.0)
        advance = float(data.get('advance', 0.0) or 0.0)
        cursor.execute("INSERT INTO shops (name, city, mobile) VALUES (?, '', '')", (name,))
        cursor.execute("INSERT INTO inventory (name, no_of_bags, price, date, type, advance) VALUES (?, ?, ?, ?, 'SHOP', ?)", (name, bags, price, date, advance))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Shop bill added'})
        
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute("SELECT * FROM inventory WHERE type = 'SHOP' AND date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'shops': [dict(r) for r in rows]})

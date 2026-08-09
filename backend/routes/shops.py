from flask import Blueprint, request, jsonify
from datetime import datetime
import db

shops_bp = Blueprint('shops', __name__)

@shops_bp.route('/api/shops', methods=['GET', 'POST'])
def handle_shops():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        name = data.get('name', '').strip()
        bags = int(data.get('bags', 0) or 0)
        price = float(data.get('price', 0.0) or 0.0)
        advance = float(data.get('advance', 0.0) or 0.0)
        cursor.execute(f"INSERT INTO shops (name, city, mobile) VALUES ({p}, '', '')", (name,))
        cursor.execute(f"INSERT INTO inventory (name, no_of_bags, price, date, type, advance) VALUES ({p}, {p}, {p}, {p}, 'SHOP', {p})", (name, bags, price, date, advance))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Shop bill added'})
        
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute(f"SELECT * FROM inventory WHERE type = 'SHOP' AND date = {p} ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'shops': [dict(r) for r in rows]})

@shops_bp.route('/api/kisans', methods=['GET', 'POST'])
def handle_kisans():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        mobile = data.get('mobile', '').strip()
        cursor.execute(f"INSERT INTO kisans (name, mobile) VALUES ({p}, {p})", (name, mobile))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Kisan added successfully'})

    cursor.execute("SELECT * FROM kisans ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'kisans': [dict(r) for r in rows]})

@shops_bp.route('/api/bags', methods=['GET', 'POST'])
def handle_bags():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        bag_type = data.get('bagType', 'Standard')
        capacity = data.get('capacity', '50kg')
        cursor.execute(f"INSERT INTO bags_config (bag_type, capacity) VALUES ({p}, {p})", (bag_type, capacity))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Bags config saved'})

    cursor.execute("SELECT * FROM bags_config ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'bags': [dict(r) for r in rows]})

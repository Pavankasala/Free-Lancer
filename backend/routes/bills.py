from flask import Blueprint, request, jsonify
from datetime import datetime
import db

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/home-bills', methods=['GET'])
@bills_bp.route('/home-bills', methods=['GET'])
def get_home_bills():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"SELECT * FROM inventory WHERE date = {p} AND type = 'BUY' ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    
    bills = [dict(row) for row in rows]
    return jsonify({'success': True, 'bills': bills, 'date': date})

@bills_bp.route('/api/add-bill', methods=['POST'])
def add_bill():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    billdate = data.get('billdate', datetime.now().strftime('%Y-%m-%d'))
    billtime = data.get('advanceTime', '') or data.get('time', '') or datetime.now().strftime('%I:%M %p')
    items = data.get('items', [])
    hamali = float(data.get('hamali', 10.0) or 10.0)
    advance = float(data.get('advance', 0.0) or 0.0)
    bags_sold = data.get('bagsSold')
    price_sold = data.get('priceSold')

    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    for idx, item in enumerate(items):
        bags = int(item.get('bags', 0) or 0)
        price = float(item.get('price', 0.0) or 0.0)
        adv = advance if idx == 0 else 0.0
        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, advance, hamali)
            VALUES ({p}, {p}, {p}, {p}, {p}, 'BUY', {p}, {p})
        ''', (name, bags, price, billdate, billtime, adv, hamali))

    if bags_sold and price_sold:
        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, paid, hamali)
            VALUES ({p}, {p}, {p}, {p}, {p}, 'SELL', 'YES', {p})
        ''', (name, int(bags_sold), float(price_sold), billdate, billtime, hamali))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Saved successfully'})

@bills_bp.route('/api/delete-bill/<int:bill_id>', methods=['DELETE'])
def delete_bill(bill_id):
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"DELETE FROM inventory WHERE id = {p}", (bill_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Bill deleted successfully'})

@bills_bp.route('/api/not-paid-bills', methods=['GET'])
def get_not_paid_bills():
    year = request.args.get('year', datetime.now().strftime('%Y'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"SELECT * FROM inventory WHERE (paid IS NULL OR paid != 'YES') AND type = 'BUY' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'bills': [dict(r) for r in rows]})

@bills_bp.route('/api/paid-bills', methods=['GET'])
def get_paid_bills():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"SELECT * FROM inventory WHERE paid = 'YES' AND date = {p} ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'bills': [dict(r) for r in rows]})

from flask import Blueprint, request, jsonify
from datetime import datetime
import db

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/home-bills', methods=['GET'])
@bills_bp.route('/home-bills', methods=['GET'])
def get_home_bills():
    date = request.args.get('date')
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if date:
        cursor.execute(f"SELECT * FROM inventory WHERE date = {p} AND (type = 'BUY' OR type IS NULL) ORDER BY id DESC", (date,))
    else:
        cursor.execute("SELECT * FROM inventory WHERE (type = 'BUY' OR type IS NULL) ORDER BY id DESC")
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

    inserted_bills = []

    if items and len(items) > 0:
        for idx, item in enumerate(items):
            bags = int(item.get('bags', 0) or 0)
            price = float(item.get('price', 0.0) or 0.0)
            adv = advance if idx == 0 else 0.0
            total = bags * price
            is_paid = 'YES' if (total > 0 and adv >= total) else 'NO'
            
            cursor.execute(f'''
                INSERT INTO inventory (name, no_of_bags, price, date, time, type, advance, hamali, paid)
                VALUES ({p}, {p}, {p}, {p}, {p}, 'BUY', {p}, {p}, {p})
            ''', (name, bags, price, billdate, billtime, adv, hamali, is_paid))
            
            inserted_bills.append({
                'name': name, 'no_of_bags': bags, 'price': price,
                'date': billdate, 'time': billtime, 'type': 'BUY', 'advance': adv, 'paid': is_paid
            })
    else:
        bags = int(data.get('no_of_bags', 0) or 0)
        price = float(data.get('price', 0.0) or 0.0)
        total = bags * price
        is_paid = 'YES' if (total > 0 and advance >= total) else 'NO'

        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, advance, hamali, paid)
            VALUES ({p}, {p}, {p}, {p}, {p}, 'BUY', {p}, {p}, {p})
        ''', (name, bags, price, billdate, billtime, advance, hamali, is_paid))

    if bags_sold and price_sold:
        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, paid, hamali)
            VALUES ({p}, {p}, {p}, {p}, {p}, 'SELL', 'YES', {p})
        ''', (name, int(bags_sold), float(price_sold), billdate, billtime, hamali))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Bill added successfully', 'bills': inserted_bills})

@bills_bp.route('/api/update-bill/<int:bill_id>', methods=['PUT', 'POST'])
def update_bill(bill_id):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    bags = int(data.get('no_of_bags', 0) or 0)
    price = float(data.get('price', 0.0) or 0.0)
    advance = float(data.get('advance', 0.0) or 0.0)
    billdate = data.get('date', '') or data.get('billdate', '')

    total = bags * price
    is_paid = 'YES' if (total > 0 and advance >= total) else 'NO'
    confirmed = 1 if is_paid == 'YES' else 0

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f'''
        UPDATE inventory 
        SET name = {p}, no_of_bags = {p}, price = {p}, advance = {p}, date = {p}, paid = {p}, confirmed = {p}
        WHERE id = {p}
    ''', (name, bags, price, advance, billdate, is_paid, confirmed, bill_id))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Bill updated successfully'})

@bills_bp.route('/api/confirm-bill/<int:bill_id>', methods=['POST', 'PUT'])
def confirm_bill(bill_id):
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f"SELECT * FROM inventory WHERE id = {p}", (bill_id,))
    row = cursor.fetchone()
    if row:
        row_dict = dict(row)
        total = (Number(row_dict.get('no_of_bags', 0)) or 0) * (Number(row_dict.get('price', 0)) or 0)
        new_adv = total if total > 0 else (row_dict.get('advance', 0) or 0)

        cursor.execute(f'''
            UPDATE inventory 
            SET paid = 'YES', confirmed = 1, advance = {p}
            WHERE id = {p}
        ''', (new_adv, bill_id))

        conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Bill confirmed successfully'})

@bills_bp.route('/api/delete-bill/<int:bill_id>', methods=['DELETE', 'POST'])
def delete_bill(bill_id):
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"DELETE FROM inventory WHERE id = {p}", (bill_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Bill deleted successfully'})

@bills_bp.route('/api/buyer-bills', methods=['GET'])
def get_buyer_bills():
    date = request.args.get('date')
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if date:
        cursor.execute(f"SELECT * FROM inventory WHERE date = {p} AND type = 'BUYER' ORDER BY id DESC", (date,))
    else:
        cursor.execute("SELECT * FROM inventory WHERE type = 'BUYER' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    bills = [dict(row) for row in rows]
    return jsonify({'success': True, 'bills': bills, 'date': date})

@bills_bp.route('/api/add-buyer-bill', methods=['POST'])
def add_buyer_bill():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    billdate = data.get('billdate', datetime.now().strftime('%Y-%m-%d'))
    billtime = data.get('advanceTime', '') or data.get('time', '') or datetime.now().strftime('%I:%M %p')
    items = data.get('items', [])
    hamali = float(data.get('hamali', 10.0) or 10.0)
    advance = float(data.get('advance', 0.0) or 0.0)

    if not name:
        return jsonify({'success': False, 'message': 'Buyer name is required'}), 400

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    for idx, item in enumerate(items):
        bags = int(item.get('bags', 0) or 0)
        price = float(item.get('price', 0.0) or 0.0)
        adv = advance if idx == 0 else 0.0
        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, advance, hamali)
            VALUES ({p}, {p}, {p}, {p}, {p}, 'BUYER', {p}, {p})
        ''', (name, bags, price, billdate, billtime, adv, hamali))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Buyer bill saved successfully'})

@bills_bp.route('/api/not-paid-bills', methods=['GET'])
def get_not_paid_bills():
    year = request.args.get('year', datetime.now().strftime('%Y'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    cursor.execute(f"SELECT * FROM inventory WHERE (paid IS NULL OR paid != 'YES') AND (type = 'BUY' OR type IS NULL) ORDER BY id DESC")
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

def Number(val):
    try:
        return float(val)
    except:
        return 0.0

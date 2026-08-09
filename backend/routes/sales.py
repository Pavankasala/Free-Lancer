from flask import Blueprint, request, jsonify
from datetime import datetime
import db

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/api/local-sale', methods=['GET', 'POST'])
def handle_local_sale():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        name = data.get('name', '').strip()
        bags = int(data.get('bags', 0) or 0)
        price = float(data.get('price', 0.0) or 0.0)
        cursor.execute(f"INSERT INTO inventory (name, no_of_bags, price, date, type, paid) VALUES ({p}, {p}, {p}, {p}, 'SELL', 'YES')", (name, bags, price, date))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Local sale added'})

    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    cursor.execute(f"SELECT * FROM inventory WHERE type = 'SELL' AND date = {p} ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'sales': [dict(r) for r in rows]})

@sales_bp.route('/api/sold-data', methods=['GET', 'POST'])
def handle_sold_data():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        sold_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        name = data.get('name', '').strip()
        sold_to = data.get('soldTo', '').strip()
        no_of_bags = int(data.get('noOfBags', 0) or 0)
        hamali_per_bag = float(data.get('hamaliPerBag', 0.0) or 0.0)
        party_commission = data.get('partyCommission', '')
        lorry_no = data.get('lorryNo', '')
        lorry_charges = float(data.get('lorryCharges', 0.0) or 0.0)
        tons = float(data.get('tons', 0.0) or 0.0)
        enam = data.get('enam', '')
        lorry_advance = float(data.get('lorryAdvance', 0.0) or 0.0)
        village_ref = data.get('villageRef', '')

        cursor.execute(f'''
            INSERT INTO sold_data (date, name, sold_to, no_of_bags, hamali_per_bag, party_commission, lorry_no, lorry_charges, tons, enam, lorry_advance, village_ref)
            VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
        ''', (sold_date, name, sold_to, no_of_bags, hamali_per_bag, party_commission, lorry_no, lorry_charges, tons, enam, lorry_advance, village_ref))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Sold data saved successfully'})

    date = request.args.get('date')
    if date:
        cursor.execute(f"SELECT * FROM sold_data WHERE date = {p} ORDER BY id DESC", (date,))
    else:
        cursor.execute("SELECT * FROM sold_data ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'sold_data': [dict(r) for r in rows]})

@sales_bp.route('/api/update-sold-data/<int:sold_id>', methods=['PUT', 'POST'])
def update_sold_data(sold_id):
    data = request.get_json() or {}
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f'''
        UPDATE sold_data
        SET date = {p}, name = {p}, sold_to = {p}, no_of_bags = {p}, hamali_per_bag = {p},
            party_commission = {p}, lorry_no = {p}, lorry_charges = {p}, tons = {p},
            enam = {p}, lorry_advance = {p}, village_ref = {p}
        WHERE id = {p}
    ''', (
        data.get('date'), data.get('name'), data.get('soldTo'), int(data.get('noOfBags', 0) or 0),
        float(data.get('hamaliPerBag', 0.0) or 0.0), data.get('partyCommission'), data.get('lorryNo'),
        float(data.get('lorryCharges', 0.0) or 0.0), float(data.get('tons', 0.0) or 0.0),
        data.get('enam'), float(data.get('lorryAdvance', 0.0) or 0.0), data.get('villageRef'), sold_id
    ))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Sold data updated successfully'})

@sales_bp.route('/api/delete-sold-data/<int:sold_id>', methods=['DELETE', 'POST'])
def delete_sold_data(sold_id):
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f"DELETE FROM sold_data WHERE id = {p}", (sold_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Sold data deleted successfully'})

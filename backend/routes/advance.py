from flask import Blueprint, request, jsonify
from datetime import datetime
import db

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/api/advances', methods=['GET'])
@advance_bp.route('/api/advance', methods=['GET', 'POST'])
def handle_advance():
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        adv_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        amount = float(data.get('amount', 0.0) or data.get('advance', 0.0) or 0.0)
        billtime = data.get('time', '12:00 PM')
        
        cursor.execute(f"INSERT INTO inventory (name, date, time, type, advance, paid) VALUES ({p}, {p}, {p}, 'ADVANCE', {p}, 'NO')", (name, adv_date, billtime, amount))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Advance added successfully'})
        
    date = request.args.get('date')
    kisan = request.args.get('kisan')

    query = "SELECT * FROM inventory WHERE (type = 'ADVANCE' OR advance > 0)"
    params = []

    if date:
        query += f" AND date = {p}"
        params.append(date)
    if kisan:
        query += f" AND LOWER(name) LIKE {p}"
        params.append(f"%{kisan.lower()}%")

    query += " ORDER BY id DESC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'advances': [dict(r) for r in rows]})

@advance_bp.route('/api/add-multi-advance', methods=['POST'])
def add_multi_advance():
    data = request.get_json() or {}
    adv_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    items = data.get('advances', {})  # { 'AVR': 3000, 'BVS': 260 }

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    inserted_count = 0
    for kisan, val in items.items():
        amt = float(val or 0.0)
        if amt > 0:
            cursor.execute(f"INSERT INTO inventory (name, date, time, type, advance, paid) VALUES ({p}, {p}, '12:00 PM', 'ADVANCE', {p}, 'NO')", (kisan, adv_date, amt))
            inserted_count += 1

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Multi advance added for {inserted_count} kisans'})

@advance_bp.route('/api/update-advance/<int:adv_id>', methods=['PUT', 'POST'])
def update_advance(adv_id):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    amount = float(data.get('amount', 0.0) or data.get('advance', 0.0) or 0.0)
    adv_date = data.get('date', '')

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f"UPDATE inventory SET name = {p}, advance = {p}, date = {p} WHERE id = {p}", (name, amount, adv_date, adv_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Advance updated successfully'})

@advance_bp.route('/api/delete-advance/<int:adv_id>', methods=['DELETE', 'POST'])
def delete_advance(adv_id):
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f"DELETE FROM inventory WHERE id = {p}", (adv_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Advance deleted successfully'})

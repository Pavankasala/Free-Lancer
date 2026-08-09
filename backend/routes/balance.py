from flask import Blueprint, request, jsonify
from datetime import datetime
import db

balance_bp = Blueprint('balance', __name__)

@balance_bp.route('/api/balance-sheet', methods=['GET'])
def get_balance_sheet():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    cursor.execute(f"SELECT SUM(no_of_bags * price) as total_buy, SUM(no_of_bags) as total_bags FROM inventory WHERE date = {p} AND type = 'BUY'", (date,))
    buy_res = cursor.fetchone()
    buy_dict = dict(buy_res) if buy_res else {}

    cursor.execute(f"SELECT SUM(amount) as total_exp FROM expenditures WHERE date = {p}", (date,))
    exp_res = cursor.fetchone()
    exp_dict = dict(exp_res) if exp_res else {}

    cursor.execute(f"SELECT SUM(amount) as total_cash FROM cash_collection WHERE date = {p}", (date,))
    cash_res = cursor.fetchone()
    cash_dict = dict(cash_res) if cash_res else {}

    conn.close()

    return jsonify({
        'success': True,
        'date': date,
        'total_buy': buy_dict.get('total_buy') or 0.0,
        'total_bags': buy_dict.get('total_bags') or 0,
        'total_expenditures': exp_dict.get('total_exp') or 0.0,
        'total_cash': cash_dict.get('total_cash') or 0.0
    })

@balance_bp.route('/api/kisan-balance', methods=['GET'])
def get_kisan_balance():
    name = request.args.get('name', '').strip()
    year = request.args.get('year', datetime.now().strftime('%Y'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    query = f"SELECT * FROM inventory WHERE (type = 'BUY' OR type IS NULL)"
    params = []

    if name:
        query += f" AND LOWER(name) LIKE {p}"
        params.append(f"%{name.lower()}%")
    if year:
        query += f" AND date LIKE {p}"
        params.append(f"{year}%")

    query += " ORDER BY id DESC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'records': [dict(r) for r in rows]})

@balance_bp.route('/api/buyer-balance', methods=['GET'])
def get_buyer_balance():
    name = request.args.get('name', '').strip()
    year = request.args.get('year', datetime.now().strftime('%Y'))
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()

    query = f"SELECT * FROM inventory WHERE type = 'BUYER'"
    params = []

    if name:
        query += f" AND LOWER(name) LIKE {p}"
        params.append(f"%{name.lower()}%")
    if year:
        query += f" AND date LIKE {p}"
        params.append(f"{year}%")

    query += " ORDER BY id DESC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()

    records = [dict(r) for r in rows]
    total_amount = sum((r.get('no_of_bags', 0) or 0) * (r.get('price', 0) or 0) for r in records)
    cash_paid = sum((r.get('no_of_bags', 0) * r.get('price', 0)) if r.get('paid') == 'YES' else (r.get('advance', 0) or 0) for r in records)
    pending_balance = total_amount - cash_paid

    return jsonify({
        'success': True,
        'records': records,
        'summary': {
            'total_amount': total_amount,
            'cash_paid': cash_paid,
            'pending_balance': pending_balance
        }
    })

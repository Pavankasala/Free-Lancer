from flask import Blueprint, request, jsonify
from datetime import datetime
import db

balance_bp = Blueprint('balance', __name__)

@balance_bp.route('/api/balance-sheet', methods=['GET'])
def get_balance_sheet():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT SUM(no_of_bags * price) as total_buy, SUM(no_of_bags) as total_bags FROM inventory WHERE date = ? AND type = 'BUY'", (date,))
    buy_res = cursor.fetchone()
    
    cursor.execute("SELECT SUM(amount) as total_exp FROM expenditures WHERE date = ?", (date,))
    exp_res = cursor.fetchone()
    
    cursor.execute("SELECT SUM(amount) as total_cash FROM cash_collection WHERE date = ?", (date,))
    cash_res = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'success': True,
        'date': date,
        'total_buy': buy_res['total_buy'] or 0.0,
        'total_bags': buy_res['total_bags'] or 0,
        'total_expenditures': exp_res['total_exp'] or 0.0,
        'total_cash': cash_res['total_cash'] or 0.0
    })

@balance_bp.route('/api/kisan-balance', methods=['GET'])
def get_kisan_balance():
    name = request.args.get('name', '').strip()
    year = request.args.get('year', datetime.now().strftime('%Y'))
    conn = db.get_db()
    cursor = conn.cursor()
    if name:
        cursor.execute("SELECT * FROM inventory WHERE name LIKE ? AND strftime('%Y', date) = ? ORDER BY id DESC", (f'%{name}%', year))
    else:
        cursor.execute("SELECT * FROM inventory WHERE strftime('%Y', date) = ? ORDER BY id DESC", (year,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'records': [dict(r) for r in rows]})

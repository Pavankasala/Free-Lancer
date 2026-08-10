from datetime import datetime
from flask import Blueprint, g, jsonify, request

import db
from security import require_auth

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/api/beat-paper', methods=['GET'])
@require_auth
def get_beat_paper():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"SELECT * FROM inventory WHERE user_id = {p} AND date = {p} AND (type = 'BUY' OR type IS NULL) ORDER BY id DESC",
            (g.user_id, date),
        )
        rows = cursor.fetchall()
        return jsonify({'success': True, 'reports': [dict(r) for r in rows]})
    finally:
        conn.close()


@reports_bp.route('/api/sms-to-send', methods=['GET'])
@require_auth
def get_sms_to_send():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"SELECT * FROM inventory WHERE user_id = {p} AND date = {p} AND (type = 'BUY' OR type IS NULL) ORDER BY id DESC",
            (g.user_id, date),
        )
        rows = cursor.fetchall()
        bills = [dict(r) for r in rows]
        sms_list = []

        for idx, bill in enumerate(bills):
            name = bill.get('name', 'Kisan')
            bags = bill.get('no_of_bags', 0)
            price = bill.get('price', 0)
            mobile = bill.get('mobile', '-')
            msg = f"Hi {name}, (Total Bags: {bags})\n   {bags} X {price}\n   --- I.L.C.\nMobile No: {mobile}"
            sms_list.append({
                'sno': idx + 1,
                'kisanName': name,
                'mobile': mobile,
                'smsText': msg,
            })

        return jsonify({'success': True, 'sms_list': sms_list})
    finally:
        conn.close()


@reports_bp.route('/api/sms-history', methods=['GET', 'POST'])
@require_auth
def sms_history():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()

        if request.method == 'POST':
            data = request.get_json(silent=True) or {}
            date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            mobile = data.get('mobile', '')
            message = data.get('message', '')
            cursor.execute(
                f"INSERT INTO sms_logs (user_id, date, mobile, message, status) VALUES ({p}, {p}, {p}, {p}, 'SENT')",
                (g.user_id, date, mobile, message),
            )
            conn.commit()
            return jsonify({'success': True, 'message': 'SMS logged'})

        date = request.args.get('date')
        if date:
            cursor.execute(
                f"SELECT * FROM sms_logs WHERE user_id = {p} AND date = {p} ORDER BY id DESC",
                (g.user_id, date),
            )
        else:
            cursor.execute(
                f"SELECT * FROM sms_logs WHERE user_id = {p} ORDER BY id DESC",
                (g.user_id,),
            )
        rows = cursor.fetchall()
        return jsonify({'success': True, 'history': [dict(r) for r in rows]})
    finally:
        conn.close()


@reports_bp.route('/api/send-sms', methods=['POST', 'OPTIONS'])
@require_auth
def send_sms():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    data = request.get_json(silent=True) or {}
    mobile = (data.get('mobile') or data.get('phone') or '').strip()
    message = (data.get('message') or '').strip()
    date = data.get('date', datetime.now().strftime('%Y-%m-%d'))

    if not message:
        return jsonify({'success': False, 'message': 'SMS message content is required'}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"INSERT INTO sms_logs (user_id, date, mobile, message, status) VALUES ({p}, {p}, {p}, {p}, 'SENT')",
            (g.user_id, date, mobile, message),
        )
        conn.commit()
        return jsonify({'success': True, 'message': f'SMS logged/sent for {mobile}'})
    finally:
        conn.close()


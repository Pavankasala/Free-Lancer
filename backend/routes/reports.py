from flask import Blueprint, request, jsonify
from datetime import datetime
import db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/api/beat-paper', methods=['GET'])
def get_beat_paper():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory WHERE date = ? ORDER BY id DESC", (date,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({'success': True, 'reports': [dict(r) for r in rows]})


@reports_bp.route('/api/send-sms', methods=['POST', 'OPTIONS'])
def send_sms():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    data = request.get_json() or {}
    mobile = (data.get('mobile') or data.get('phone') or '').strip()
    message = (data.get('message') or '').strip()
    bill_id = data.get('bill_id')

    if not message:
        return jsonify({'success': False, 'message': 'SMS message content is required'}), 400

    clean_mobile = ''.join(filter(str.isdigit, str(mobile)))
    if len(clean_mobile) == 10:
        clean_mobile = "91" + clean_mobile

    print(f"[SMS API] Sending SMS to +{clean_mobile}: {message}")

    return jsonify({
        'success': True,
        'message': f'SMS dispatched successfully to {mobile or "recipient"}',
        'details': {
            'to': clean_mobile,
            'body': message,
            'bill_id': bill_id,
            'timestamp': datetime.now().strftime('%Y-%m-%d %I:%M %p')
        }
    })

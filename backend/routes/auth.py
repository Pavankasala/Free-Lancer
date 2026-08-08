from flask import Blueprint, request, jsonify
import hashlib
import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    pwd_hash = hashlib.md5(password.encode()).hexdigest()
    
    conn = db.get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user WHERE user_name = ? AND password = ?", (username, pwd_hash))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        user_dict = dict(user)
        user_dict.pop('password', None)
        return jsonify({'success': True, 'user': user_dict})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

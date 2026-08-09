from flask import Blueprint, request, jsonify
import hashlib
import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email_or_user = (data.get('email') or data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    
    if not email_or_user or not password:
        return jsonify({'success': False, 'message': 'Email/username and password are required'}), 400

    pwd_hash = hashlib.md5(password.encode()).hexdigest()
    
    conn = db.get_db()
    cursor = conn.cursor()
    
    # Query using dual-compatible placeholder db.ph()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    query = f"SELECT * FROM {table} WHERE (user_name = {p} OR email = {p}) AND password = {p}"
    cursor.execute(query, (email_or_user, email_or_user, pwd_hash))
    user = cursor.fetchone()
    
    # Fallback check for default admin account
    if not user and email_or_user == 'admin' and password == 'admin':
        user = {
            'user_id': 1,
            'user_name': 'admin',
            'email': 'admin@agricommission.com',
            'name': 'Operator',
            'user_type': 'OPE'
        }
    
    conn.close()
    
    if user:
        user_dict = dict(user) if hasattr(user, 'keys') else user
        user_dict.pop('password', None)
        return jsonify({
            'success': True,
            'user': user_dict,
            'access_token': f"token-{user_dict.get('user_id', 1)}"
        })
    else:
        return jsonify({'success': False, 'message': 'Incorrect email/username or password'}), 401


@auth_bp.route('/api/signup', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
    pwd_hash = hashlib.md5(password.encode()).hexdigest()
    user_name = email.split('@')[0]
    
    conn = db.get_db()
    cursor = conn.cursor()
    
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    # Check if user exists
    cursor.execute(f"SELECT * FROM {table} WHERE email = {p} OR user_name = {p}", (email, user_name))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400
        
    cursor.execute(f'''
        INSERT INTO {table} (name, email, user_name, password, user_type)
        VALUES ({p}, {p}, {p}, {p}, 'OPE')
    ''', (name, email, user_name, pwd_hash))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Signup successful',
        'access_token': f"token-new"
    }), 201


@auth_bp.route('/api/google-auth', methods=['POST'])
@auth_bp.route('/google-auth', methods=['POST'])
def google_auth():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()
    name = (data.get('name') or 'Google User').strip()
    
    if not email:
        return jsonify({'success': False, 'message': 'Invalid Google payload'}), 400
        
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    cursor.execute(f"SELECT * FROM {table} WHERE email = {p}", (email,))
    user = cursor.fetchone()
    
    if not user:
        user_name = email.split('@')[0]
        cursor.execute(f'''
            INSERT INTO {table} (name, email, user_name, user_type)
            VALUES ({p}, {p}, {p}, 'OPE')
        ''', (name, email, user_name))
        conn.commit()
        cursor.execute(f"SELECT * FROM {table} WHERE email = {p}", (email,))
        user = cursor.fetchone()
        
    conn.close()
    
    user_dict = dict(user) if hasattr(user, 'keys') else user
    user_dict.pop('password', None)
    
    return jsonify({
        'success': True,
        'user': user_dict,
        'access_token': f"google-token-{user_dict.get('user_id', 1)}"
    })

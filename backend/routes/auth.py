from flask import Blueprint, request, jsonify
import hashlib
import db

auth_bp = Blueprint('auth', __name__)

def normalize_user(user_data):
    """Formats raw database row into clean user object"""
    if not user_data:
        return None
    u = dict(user_data) if hasattr(user_data, 'keys') else dict(user_data)
    u.pop('password', None)
    u['business_name'] = u.get('company_full_name') or u.get('company_name') or 'Agri Commission Manager'
    u['owner_name'] = u.get('name') or u.get('user_name') or 'Operator'
    u['phone'] = u.get('mobile') or ''
    return u

@auth_bp.route('/api/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email_or_user = (data.get('email') or data.get('username') or '').strip().lower()
    password = (data.get('password') or '').strip()
    
    if not email_or_user or not password:
        return jsonify({'success': False, 'message': 'Email/username and password are required'}), 400

    pwd_hash = hashlib.md5(password.encode()).hexdigest()
    
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    # Unified Query matching either LOWER(user_name) or LOWER(email)
    query = f"SELECT * FROM {table} WHERE (LOWER(user_name) = {p} OR LOWER(email) = {p}) AND password = {p}"
    cursor.execute(query, (email_or_user, email_or_user, pwd_hash))
    user = cursor.fetchone()
    
    # Admin Fallback Check
    if not user and email_or_user in ['admin', 'admin@agricommission.com'] and password == 'admin':
        cursor.execute(f"SELECT * FROM {table} WHERE LOWER(user_name) = 'admin' OR LOWER(email) = 'admin@agricommission.com'")
        user = cursor.fetchone()
        if not user:
            user = {
                'user_id': 1,
                'user_name': 'admin',
                'email': 'admin@agricommission.com',
                'name': 'Operator',
                'user_type': 'OPE'
            }
    
    conn.close()
    
    if user:
        user_obj = normalize_user(user)
        user_id = user_obj.get('user_id', 1)
        return jsonify({
            'success': True,
            'user': user_obj,
            'access_token': f"token-{user_id}"
        })
    else:
        return jsonify({'success': False, 'message': 'Incorrect email/username or password'}), 401


@auth_bp.route('/api/signup', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
    pwd_hash = hashlib.md5(password.encode()).hexdigest()
    user_name = email.split('@')[0]
    
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    # Check if user already exists by email or user_name
    cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p} OR LOWER(user_name) = {p}", (email, user_name))
    existing = cursor.fetchone()
    
    if existing:
        existing_dict = dict(existing) if hasattr(existing, 'keys') else dict(existing)
        # Account linking: If user signed up via Google OAuth previously without a password, set their password to link accounts!
        if not existing_dict.get('password'):
            cursor.execute(f"UPDATE {table} SET password = {p}, name = {p} WHERE user_id = {p}", (pwd_hash, name, existing_dict['user_id']))
            conn.commit()
            cursor.execute(f"SELECT * FROM {table} WHERE user_id = {p}", (existing_dict['user_id'],))
            updated_user = cursor.fetchone()
            conn.close()
            user_obj = normalize_user(updated_user)
            return jsonify({
                'success': True,
                'message': 'Account linked successfully! You can now log in with Email/Password or Google.',
                'user': user_obj,
                'access_token': f"token-{user_obj['user_id']}"
            }), 200
        else:
            conn.close()
            return jsonify({'success': False, 'message': 'An account with this email address already exists. Please login instead.'}), 400

    # Create new account
    cursor.execute(f'''
        INSERT INTO {table} (name, email, user_name, password, user_type, auth_provider)
        VALUES ({p}, {p}, {p}, {p}, 'OPE', 'LOCAL')
    ''', (name, email, user_name, pwd_hash))
    conn.commit()

    cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
    new_user = cursor.fetchone()
    conn.close()
    
    user_obj = normalize_user(new_user)
    user_id = user_obj.get('user_id', 1)

    return jsonify({
        'success': True,
        'message': 'Signup successful',
        'user': user_obj,
        'access_token': f"token-{user_id}"
    }), 201


@auth_bp.route('/api/google-auth', methods=['POST', 'OPTIONS'])
@auth_bp.route('/google-auth', methods=['POST', 'OPTIONS'])
def google_auth():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or email.split('@')[0] or 'Google User').strip()
    
    if not email:
        return jsonify({'success': False, 'message': 'Invalid Google payload'}), 400
        
    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'
    
    # Unified Account Linking: Check if user exists by email (case-insensitive)
    cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
    user = cursor.fetchone()
    
    if not user:
        # Create user linked to Google auth
        user_name = email.split('@')[0]
        cursor.execute(f'''
            INSERT INTO {table} (name, email, user_name, user_type, auth_provider)
            VALUES ({p}, {p}, {p}, 'OPE', 'GOOGLE')
        ''', (name, email, user_name))
        conn.commit()

        cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
        user = cursor.fetchone()
        
    conn.close()
    
    user_obj = normalize_user(user)
    user_id = user_obj.get('user_id', 1)
    
    return jsonify({
        'success': True,
        'user': user_obj,
        'access_token': f"token-{user_id}"
    })


@auth_bp.route('/api/update-profile', methods=['POST', 'OPTIONS'])
def update_profile():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200

    data = request.get_json() or {}
    user_id = data.get('user_id') or data.get('id')
    user_name = (data.get('user_name') or 'admin').strip().lower()

    name = data.get('name') or data.get('owner_name') or 'Operator'
    company_full_name = data.get('company_full_name') or data.get('business_name') or 'Agri Commission Manager'
    mobile = data.get('mobile') or data.get('phone') or ''
    address = data.get('address') or ''
    default_hamali = float(data.get('default_hamali', 0.0) or 0.0)

    conn = db.get_db()
    cursor = conn.cursor()
    p = db.ph()
    table = '"user"' if db.DATABASE_URL else 'user'

    if user_id:
        cursor.execute(f'''
            UPDATE {table}
            SET name = {p}, company_full_name = {p}, mobile = {p}, address = {p}, default_hamali = {p}
            WHERE user_id = {p}
        ''', (name, company_full_name, mobile, address, default_hamali, user_id))
    else:
        cursor.execute(f'''
            UPDATE {table}
            SET name = {p}, company_full_name = {p}, mobile = {p}, address = {p}, default_hamali = {p}
            WHERE LOWER(user_name) = {p}
        ''', (name, company_full_name, mobile, address, default_hamali, user_name))

    conn.commit()

    if user_id:
        cursor.execute(f"SELECT * FROM {table} WHERE user_id = {p}", (user_id,))
    else:
        cursor.execute(f"SELECT * FROM {table} WHERE LOWER(user_name) = {p}", (user_name,))

    updated_user = cursor.fetchone()
    conn.close()

    user_obj = normalize_user(updated_user)
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': user_obj
    })

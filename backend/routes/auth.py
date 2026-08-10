import re

from flask import Blueprint, current_app, g, jsonify, request

import db
from security import (
    create_access_token,
    hash_password,
    require_auth,
    verify_google_credential,
    verify_password,
)


auth_bp = Blueprint("auth", __name__)
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_user(user_data):
    if not user_data:
        return None
    user = dict(user_data)
    user.pop("password", None)
    user["business_name"] = user.get("company_full_name") or user.get("company_name") or "Agri Commission Manager"
    user["owner_name"] = user.get("name") or user.get("user_name") or "Operator"
    user["phone"] = user.get("mobile") or ""
    return user


def _new_username(cursor, email: str, p: str) -> str:
    base = re.sub(r"[^a-z0-9_.-]", "", email.split("@", 1)[0].lower()) or "user"
    table = db.user_table()
    candidate = base[:90]
    suffix = 1
    while True:
        cursor.execute(f"SELECT 1 FROM {table} WHERE LOWER(user_name) = {p}", (candidate,))
        if not cursor.fetchone():
            return candidate
        suffix += 1
        candidate = f"{base[:85]}{suffix}"


def _response_for_user(user):
    user_obj = normalize_user(user)
    token = create_access_token(user_obj["user_id"])
    return jsonify(
        {
            "success": True,
            "user": user_obj,
            "access_token": token,
            "token": token,
        }
    )



@auth_bp.route("/api/login", methods=["POST"])
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email_or_user = str(data.get("email") or data.get("username") or "").strip().lower()
    password = str(data.get("password") or "")
    if not email_or_user or not password:
        return jsonify({"success": False, "message": "Email/username and password are required"}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        table = db.user_table()
        cursor.execute(
            f"SELECT * FROM {table} WHERE LOWER(user_name) = {p} OR LOWER(email) = {p}",
            (email_or_user, email_or_user),
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({"success": False, "message": "Incorrect email/username or password"}), 401

        valid, needs_rehash = verify_password(dict(user).get("password"), password)
        if not valid:
            return jsonify({"success": False, "message": "Incorrect email/username or password"}), 401

        if needs_rehash:
            cursor.execute(
                f"UPDATE {table} SET password = {p} WHERE user_id = {p}",
                (hash_password(password), dict(user)["user_id"]),
            )
            conn.commit()
            cursor.execute(f"SELECT * FROM {table} WHERE user_id = {p}", (dict(user)["user_id"],))
            user = cursor.fetchone()

        return _response_for_user(user)
    finally:
        conn.close()


@auth_bp.route("/api/signup", methods=["POST"])
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required"}), 400
    if not EMAIL_RE.fullmatch(email):
        return jsonify({"success": False, "message": "Please enter a valid email address"}), 400
    if len(password) < 8:
        return jsonify({"success": False, "message": "Password must be at least 8 characters"}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        table = db.user_table()
        cursor.execute(f"SELECT user_id FROM {table} WHERE LOWER(email) = {p}", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "An account with this email already exists. Please sign in."}), 409

        user_name = _new_username(cursor, email, p)
        cursor.execute(
            f"""
            INSERT INTO {table} (name, email, user_name, password, user_type, auth_provider)
            VALUES ({p}, {p}, {p}, {p}, 'OPE', 'LOCAL')
            """,
            (name, email, user_name, hash_password(password)),
        )
        conn.commit()
        cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
        user = cursor.fetchone()
        response = _response_for_user(user)
        response.status_code = 201
        return response
    finally:
        conn.close()


@auth_bp.route("/api/google-auth", methods=["POST"])
@auth_bp.route("/google-auth", methods=["POST"])
def google_auth():
    data = request.get_json(silent=True) or {}
    credential = str(data.get("credential") or "").strip()

    if not credential and current_app.config.get("APP_ENV") != "production":
        email = str(data.get("email") or "").strip().lower()
        if not email:
            return jsonify({"success": False, "message": "Google credential or email is required"}), 400
        google_user = {"email": email, "name": str(data.get("name") or email.split("@", 1)[0]).strip()}
    else:
        try:
            google_user = verify_google_credential(credential)
        except ValueError as exc:
            message = str(exc)
            status = 503 if "not configured" in message or "not installed" in message else 401
            return jsonify({"success": False, "message": message}), status

    email = google_user["email"]
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        table = db.user_table()
        cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
        user = cursor.fetchone()

        if not user:
            user_name = _new_username(cursor, email, p)
            cursor.execute(
                f"""
                INSERT INTO {table} (name, email, user_name, user_type, auth_provider)
                VALUES ({p}, {p}, {p}, 'OPE', 'GOOGLE')
                """,
                (google_user["name"], email, user_name),
            )
            conn.commit()
            cursor.execute(f"SELECT * FROM {table} WHERE LOWER(email) = {p}", (email,))
            user = cursor.fetchone()
        else:
            existing = dict(user)
            providers = {provider for provider in str(existing.get("auth_provider") or "").split(",") if provider}
            if "GOOGLE" not in providers:
                providers.add("GOOGLE")
                cursor.execute(
                    f"UPDATE {table} SET auth_provider = {p} WHERE user_id = {p}",
                    (",".join(sorted(providers)), existing["user_id"]),
                )
                conn.commit()
                cursor.execute(f"SELECT * FROM {table} WHERE user_id = {p}", (existing["user_id"],))
                user = cursor.fetchone()

        return _response_for_user(user)
    finally:
        conn.close()


@auth_bp.route("/api/update-profile", methods=["POST"])
@require_auth
def update_profile():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or data.get("owner_name") or "").strip()
    company_full_name = str(data.get("company_full_name") or data.get("business_name") or "").strip()
    mobile = str(data.get("mobile") or data.get("phone") or "").strip()
    address = str(data.get("address") or "").strip()
    try:
        default_hamali = float(data.get("default_hamali", 0) or 0)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Default hamali must be a number"}), 400
    if default_hamali < 0:
        return jsonify({"success": False, "message": "Default hamali cannot be negative"}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        table = db.user_table()
        cursor.execute(
            f"""
            UPDATE {table}
            SET name = {p}, company_full_name = {p}, mobile = {p}, address = {p}, default_hamali = {p}
            WHERE user_id = {p}
            """,
            (name, company_full_name, mobile, address, default_hamali, g.user_id),
        )
        conn.commit()
        cursor.execute(f"SELECT * FROM {table} WHERE user_id = {p}", (g.user_id,))
        user = cursor.fetchone()
        return jsonify({"success": True, "message": "Profile updated successfully", "user": normalize_user(user)})
    finally:
        conn.close()

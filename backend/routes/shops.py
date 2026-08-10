import math
from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth


shops_bp = Blueprint("shops", __name__)


def _number(value, field):
    try:
        number = float(value or 0)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number")
    if not math.isfinite(number) or number < 0:
        raise ValueError(f"{field} cannot be negative")
    return number


@shops_bp.route("/api/shops", methods=["GET", "POST"])
@require_auth
def handle_shops():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            name = str(data.get("name") or "").strip()
            if not name:
                return jsonify({"success": False, "message": "Shop name is required"}), 400
            try:
                bags = int(_number(data.get("bags"), "Bags"))
                price = _number(data.get("price"), "Price")
                advance = _number(data.get("advance"), "Advance")
            except ValueError as exc:
                return jsonify({"success": False, "message": str(exc)}), 400
            sale_date = str(data.get("date") or datetime.now().strftime("%Y-%m-%d"))
            city = str(data.get("city") or "").strip()
            mobile = str(data.get("mobile") or "").strip()
            cursor.execute(
                f"INSERT INTO shops (user_id, name, city, mobile) VALUES ({p}, {p}, {p}, {p})",
                (g.user_id, name, city, mobile),
            )
            cursor.execute(
                f"""
                INSERT INTO inventory (user_id, name, mobile, no_of_bags, price, date, type, advance, paid, confirmed)
                VALUES ({p}, {p}, {p}, {p}, {p}, {p}, 'SHOP', {p}, 'NO', {p})
                """,
                (g.user_id, name, mobile, bags, price, sale_date, advance, False),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Shop bill added"}), 201

        date = request.args.get("date", "").strip()
        name = request.args.get("name", "").strip()
        year = request.args.get("year", "").strip()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'SHOP'"
        params = [g.user_id]
        if date:
            query += f" AND date = {p}"
            params.append(date)
        if year:
            query += f" AND date LIKE {p}"
            params.append(f"{year}%")
        if name:
            query += f" AND LOWER(name) LIKE {p}"
            params.append(f"%{name.lower()}%")
        query += " ORDER BY date DESC, id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "shops": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()


@shops_bp.route("/api/kisans", methods=["GET", "POST"])
@require_auth
def handle_kisans():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            name = str(data.get("name") or "").strip()
            mobile = str(data.get("mobile") or "").strip()
            if not name:
                return jsonify({"success": False, "message": "Kisan name is required"}), 400
            cursor.execute(
                f"INSERT INTO kisans (user_id, name, mobile) VALUES ({p}, {p}, {p})",
                (g.user_id, name, mobile),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Kisan added successfully"}), 201

        cursor.execute(f"SELECT * FROM kisans WHERE user_id = {p} ORDER BY name COLLATE NOCASE", (g.user_id,)) if not db.using_postgres() else cursor.execute(f"SELECT * FROM kisans WHERE user_id = {p} ORDER BY LOWER(name)", (g.user_id,))
        return jsonify({"success": True, "kisans": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()


@shops_bp.route("/api/bags", methods=["GET", "POST"])
@require_auth
def handle_bags():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            bag_type = str(data.get("bagType") or "").strip()
            capacity = str(data.get("capacity") or "").strip()
            if not bag_type or not capacity:
                return jsonify({"success": False, "message": "Bag type and capacity are required"}), 400
            cursor.execute(
                f"INSERT INTO bags_config (user_id, bag_type, capacity) VALUES ({p}, {p}, {p})",
                (g.user_id, bag_type, capacity),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Bags configuration saved"}), 201

        cursor.execute(f"SELECT * FROM bags_config WHERE user_id = {p} ORDER BY id DESC", (g.user_id,))
        return jsonify({"success": True, "bags": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()

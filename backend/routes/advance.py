import math
from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth


advance_bp = Blueprint("advance", __name__)


def _amount(value):
    try:
        amount = float(value or 0)
    except (TypeError, ValueError):
        raise ValueError("Advance amount must be a number")
    if not math.isfinite(amount) or amount <= 0:
        raise ValueError("Advance amount must be greater than zero")
    return amount


@advance_bp.route("/api/advances", methods=["GET"])
@advance_bp.route("/api/advance", methods=["GET", "POST"])
@require_auth
def handle_advance():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        name = str(data.get("name") or "").strip()
        if not name:
            return jsonify({"success": False, "message": "Kisan name is required"}), 400
        try:
            amount = _amount(data.get("amount", data.get("advance")))
        except ValueError as exc:
            return jsonify({"success": False, "message": str(exc)}), 400

        advance_date = str(data.get("date") or datetime.now().strftime("%Y-%m-%d"))
        bill_time = str(data.get("time") or "12:00 PM")
        conn = db.get_db()
        try:
            cursor = conn.cursor()
            p = db.ph()
            cursor.execute(
                f"""
                INSERT INTO inventory (user_id, name, date, time, type, advance, paid, confirmed)
                VALUES ({p}, {p}, {p}, {p}, 'ADVANCE', {p}, 'NO', {p})
                """,
                (g.user_id, name, advance_date, bill_time, amount, False),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Advance added successfully"}), 200
        finally:
            conn.close()

    date = request.args.get("date", "").strip()
    kisan = request.args.get("kisan", "").strip()
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'ADVANCE'"
        params = [g.user_id]
        if date:
            query += f" AND date = {p}"
            params.append(date)
        if kisan:
            query += f" AND LOWER(name) LIKE {p}"
            params.append(f"%{kisan.lower()}%")
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "advances": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()


@advance_bp.route("/api/add-multi-advance", methods=["POST"])
@require_auth
def add_multi_advance():
    data = request.get_json(silent=True) or {}
    items = data.get("advances")
    if not isinstance(items, dict):
        return jsonify({"success": False, "message": "Advances must be a Kisan-to-amount object"}), 400

    valid_items = []
    for kisan, value in items.items():
        name = str(kisan or "").strip()
        if not name:
            continue
        try:
            amount = _amount(value)
        except ValueError:
            continue
        valid_items.append((name, amount))

    if not valid_items:
        return jsonify({"success": False, "message": "Enter an amount greater than zero for at least one Kisan"}), 400

    advance_date = str(data.get("date") or datetime.now().strftime("%Y-%m-%d"))
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        for name, amount in valid_items:
            cursor.execute(
                f"""
                INSERT INTO inventory (user_id, name, date, time, type, advance, paid, confirmed)
                VALUES ({p}, {p}, {p}, '12:00 PM', 'ADVANCE', {p}, 'NO', {p})
                """,
                (g.user_id, name, advance_date, amount, False),
            )
        conn.commit()
        return jsonify({"success": True, "message": f"Multi advance added for {len(valid_items)} Kis­ans"}), 200
    finally:
        conn.close()


@advance_bp.route("/api/update-advance/<int:adv_id>", methods=["PUT"])
@require_auth
def update_advance(adv_id):
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Kisan name is required"}), 400
    try:
        amount = _amount(data.get("amount", data.get("advance")))
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"""
            UPDATE inventory SET name = {p}, advance = {p}, date = {p}
            WHERE id = {p} AND user_id = {p} AND type = 'ADVANCE'
            """,
            (name, amount, str(data.get("date") or ""), adv_id, g.user_id),
        )
        if cursor.rowcount != 1:
            return jsonify({"success": False, "message": "Advance not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Advance updated successfully"})
    finally:
        conn.close()


@advance_bp.route("/api/delete-advance/<int:adv_id>", methods=["DELETE"])
@require_auth
def delete_advance(adv_id):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"DELETE FROM inventory WHERE id = {p} AND user_id = {p} AND type = 'ADVANCE'",
            (adv_id, g.user_id),
        )
        if cursor.rowcount != 1:
            return jsonify({"success": False, "message": "Advance not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Advance deleted successfully"})
    finally:
        conn.close()

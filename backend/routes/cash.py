import math
from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth


cash_bp = Blueprint("cash", __name__)


def _amount(value):
    try:
        amount = float(value or 0)
    except (TypeError, ValueError):
        raise ValueError("Amount must be a number")
    if not math.isfinite(amount) or amount < 0:
        raise ValueError("Amount cannot be negative")
    return amount


@cash_bp.route("/api/cash-collection", methods=["GET", "POST"])
@require_auth
def handle_cash_collection():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            try:
                amount = _amount(data.get("amount"))
            except ValueError as exc:
                return jsonify({"success": False, "message": str(exc)}), 400
            given_by = str(data.get("given_by") or "").strip()
            if not given_by:
                return jsonify({"success": False, "message": "Given by is required"}), 400
            collection_date = str(data.get("date") or datetime.now().strftime("%Y-%m-%d"))
            cursor.execute(
                f"INSERT INTO cash_collection (user_id, date, amount, given_by) VALUES ({p}, {p}, {p}, {p})",
                (g.user_id, collection_date, amount, given_by),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Cash collection added"}), 201

        date = request.args.get("date", "").strip()
        from_date = request.args.get("fromDate", "").strip()
        to_date = request.args.get("toDate", "").strip()
        if bool(from_date) != bool(to_date):
            return jsonify({"success": False, "message": "Both fromDate and toDate are required for a range"}), 400
        if from_date and from_date > to_date:
            return jsonify({"success": False, "message": "fromDate cannot be after toDate"}), 400

        query = f"SELECT * FROM cash_collection WHERE user_id = {p}"
        params = [g.user_id]
        if from_date:
            query += f" AND date BETWEEN {p} AND {p}"
            params.extend([from_date, to_date])
        else:
            query += f" AND date = {p}"
            params.append(date or datetime.now().strftime("%Y-%m-%d"))
        query += " ORDER BY date DESC, id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "cash_collections": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()

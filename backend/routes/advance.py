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
                SELECT id, advance FROM inventory
                WHERE user_id = {p} AND date = {p} AND (LOWER(name) = {p} OR LOWER(COALESCE(source_kisan_name, '')) = {p})
                ORDER BY id DESC LIMIT 1
                """,
                (g.user_id, advance_date, name.lower(), name.lower()),
            )
            row = cursor.fetchone()
            if row:
                row_dict = dict(row)
                new_advance = float(row_dict.get("advance") or 0) + amount
                cursor.execute(
                    f"UPDATE inventory SET advance = {p} WHERE id = {p} AND user_id = {p}",
                    (new_advance, row_dict["id"], g.user_id),
                )
            else:
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

        # Subquery to get total bags and total value per bill_group_id
        group_bags_sub = f"""
            SELECT bill_group_id,
                   SUM(no_of_bags) AS total_bags,
                   SUM(no_of_bags * price) AS total_val
            FROM inventory
            WHERE user_id = {p} AND bill_group_id IS NOT NULL
            GROUP BY bill_group_id
        """

        query = f"""
            SELECT i.*,
                COALESCE(grp.total_bags, i.no_of_bags) AS display_bags,
                COALESCE(grp.total_val, i.no_of_bags * i.price) AS display_total
            FROM inventory i
            LEFT JOIN ({group_bags_sub}) grp ON i.bill_group_id = grp.bill_group_id
            WHERE i.user_id = {p}
              AND (i.type IN ('ADVANCE', 'BUY', 'BUYER') OR (i.advance IS NOT NULL AND i.advance > 0))
              AND (i.advance IS NOT NULL AND i.advance > 0 OR i.type = 'ADVANCE')
        """
        params = [g.user_id, g.user_id]

        if date:
            query += f" AND i.date = {p}"
            params.append(date)
        if kisan:
            query += f" AND (LOWER(i.name) LIKE {p} OR LOWER(COALESCE(i.source_kisan_name, '')) LIKE {p})"
            params.append(f"%{kisan.lower()}%")
            params.append(f"%{kisan.lower()}%")
        query += " ORDER BY i.id DESC"

        cursor.execute(query, tuple(params))
        rows = [dict(row) for row in cursor.fetchall()]
        for r in rows:
            r["no_of_bags"] = r.get("display_bags") or r.get("no_of_bags") or 0
            old_bal = float(r.get("display_total") or 0.0)
            adv = float(r.get("advance") or 0.0)
            r["old_balance"] = old_bal
            r["remaining_to_pay"] = max(old_bal - adv, 0.0) if r.get("paid") != "YES" else 0.0
            src = r.get("source_kisan_name")
            nm = r.get("name")
            if not nm and src:
                r["name"] = src
            elif src and nm and src != nm:
                r["name"] = f"{nm} ({src})"
        return jsonify({"success": True, "advances": rows})
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
                SELECT id, advance FROM inventory
                WHERE user_id = {p} AND date = {p} AND (LOWER(name) = {p} OR LOWER(COALESCE(source_kisan_name, '')) = {p})
                ORDER BY id DESC LIMIT 1
                """,
                (g.user_id, advance_date, name.lower(), name.lower()),
            )
            row = cursor.fetchone()
            if row:
                row_dict = dict(row)
                new_advance = float(row_dict.get("advance") or 0) + amount
                cursor.execute(
                    f"UPDATE inventory SET advance = {p} WHERE id = {p} AND user_id = {p}",
                    (new_advance, row_dict["id"], g.user_id),
                )
            else:
                cursor.execute(
                    f"""
                    INSERT INTO inventory (user_id, name, date, time, type, advance, paid, confirmed)
                    VALUES ({p}, {p}, {p}, '12:00 PM', 'ADVANCE', {p}, 'NO', {p})
                    """,
                    (g.user_id, name, advance_date, amount, False),
                )
        conn.commit()
        return jsonify({"success": True, "message": f"Multi advance added for {len(valid_items)} Kisans"}), 200
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

    advance_date = str(data.get("date") or data.get("billdate") or datetime.now().strftime("%Y-%m-%d"))
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"""
            UPDATE inventory SET name = {p}, advance = {p}, date = {p}
            WHERE id = {p} AND user_id = {p} AND (type = 'ADVANCE' OR (advance IS NOT NULL AND advance > 0))
            """,
            (name, amount, advance_date, adv_id, g.user_id),
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
        if cursor.rowcount == 0:
            cursor.execute(
                f"UPDATE inventory SET advance = 0.0 WHERE id = {p} AND user_id = {p}",
                (adv_id, g.user_id),
            )
            if cursor.rowcount == 0:
                return jsonify({"success": False, "message": "Advance not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Advance deleted successfully"})
    finally:
        conn.close()

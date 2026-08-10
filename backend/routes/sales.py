import math
from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth


sales_bp = Blueprint("sales", __name__)


def _number(value, field, *, minimum=0.0):
    try:
        number = float(value or 0)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number")
    if not math.isfinite(number) or number < minimum:
        raise ValueError(f"{field} cannot be negative")
    return number


def _local_sale_items(data):
    raw_items = data.get("items")
    if raw_items is None:
        raw_items = [{"kisanName": data.get("name"), "bags": data.get("bags"), "price": data.get("price")}]
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("At least one local sale item is required")
    result = []
    for item in raw_items:
        if not isinstance(item, dict):
            raise ValueError("Each local sale item must be valid")
        bags = int(_number(item.get("bags"), "Bags"))
        price = _number(item.get("price"), "Price")
        if bags <= 0:
            raise ValueError("Bags must be greater than zero")
        result.append((str(item.get("kisanName") or "").strip(), bags, price))
    return result


@sales_bp.route("/api/local-sale", methods=["GET", "POST"])
@require_auth
def handle_local_sale():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            buyer_name = str(data.get("name") or "").strip()
            if not buyer_name:
                return jsonify({"success": False, "message": "Local sale name is required"}), 400
            try:
                items = _local_sale_items(data)
                advance = _number(data.get("advance"), "Advance")
            except ValueError as exc:
                return jsonify({"success": False, "message": str(exc)}), 400

            sale_date = str(data.get("date") or datetime.now().strftime("%Y-%m-%d"))
            for index, (kisan_name, bags, price) in enumerate(items):
                cursor.execute(
                    f"""
                    INSERT INTO inventory (
                        user_id, name, source_kisan_name, no_of_bags, price, date, type, advance, paid, confirmed
                    ) VALUES ({p}, {p}, {p}, {p}, {p}, {p}, 'SELL', {p}, 'YES', {p})
                    """,
                    (g.user_id, buyer_name, kisan_name or None, bags, price, sale_date, advance if index == 0 else 0.0, True),
                )
            conn.commit()
            return jsonify({"success": True, "message": "Local sale saved"}), 200

        date = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
        cursor.execute(
            f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'SELL' AND date = {p} ORDER BY id DESC",
            (g.user_id, date),
        )
        return jsonify({"success": True, "sales": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()


@sales_bp.route("/api/delete-local-sale/<int:sale_id>", methods=["DELETE"])
@require_auth
def delete_local_sale(sale_id):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"DELETE FROM inventory WHERE id = {p} AND user_id = {p} AND type = 'SELL'",
            (sale_id, g.user_id),
        )
        if cursor.rowcount != 1:
            return jsonify({"success": False, "message": "Local sale not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Local sale deleted"})
    finally:
        conn.close()


def _sold_data_values(data):
    try:
        return (
            str(data.get("date") or datetime.now().strftime("%Y-%m-%d")),
            str(data.get("name") or "").strip(),
            str(data.get("soldTo") or "").strip(),
            int(_number(data.get("noOfBags"), "Number of bags")),
            _number(data.get("hamaliPerBag"), "Hamali per bag"),
            str(data.get("partyCommission") or "").strip(),
            str(data.get("lorryNo") or "").strip(),
            _number(data.get("lorryCharges"), "Lorry charges"),
            _number(data.get("tons"), "Tons"),
            str(data.get("enam") or "").strip(),
            _number(data.get("lorryAdvance"), "Lorry advance"),
            str(data.get("villageRef") or "").strip(),
        )
    except ValueError:
        raise


@sales_bp.route("/api/sold-data", methods=["GET", "POST"])
@require_auth
def handle_sold_data():
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            try:
                values = _sold_data_values(data)
            except ValueError as exc:
                return jsonify({"success": False, "message": str(exc)}), 400
            if not values[1] or not values[2]:
                return jsonify({"success": False, "message": "Name and sold-to are required"}), 400
            cursor.execute(
                f"""
                INSERT INTO sold_data (
                    user_id, date, name, sold_to, no_of_bags, hamali_per_bag, party_commission,
                    lorry_no, lorry_charges, tons, enam, lorry_advance, village_ref
                ) VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
                """,
                (g.user_id, *values),
            )
            conn.commit()
            return jsonify({"success": True, "message": "Sold data saved successfully"}), 200

        date = request.args.get("date", "").strip()
        query = f"SELECT * FROM sold_data WHERE user_id = {p}"
        params = [g.user_id]
        if date:
            query += f" AND date = {p}"
            params.append(date)
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "sold_data": [dict(row) for row in cursor.fetchall()]})
    finally:
        conn.close()


@sales_bp.route("/api/update-sold-data/<int:sold_id>", methods=["PUT"])
@require_auth
def update_sold_data(sold_id):
    data = request.get_json(silent=True) or {}
    try:
        values = _sold_data_values(data)
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400
    if not values[1] or not values[2]:
        return jsonify({"success": False, "message": "Name and sold-to are required"}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"""
            UPDATE sold_data
            SET date = {p}, name = {p}, sold_to = {p}, no_of_bags = {p}, hamali_per_bag = {p},
                party_commission = {p}, lorry_no = {p}, lorry_charges = {p}, tons = {p},
                enam = {p}, lorry_advance = {p}, village_ref = {p}
            WHERE id = {p} AND user_id = {p}
            """,
            (*values, sold_id, g.user_id),
        )
        if cursor.rowcount != 1:
            return jsonify({"success": False, "message": "Sold record not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Sold data updated successfully"})
    finally:
        conn.close()


@sales_bp.route("/api/delete-sold-data/<int:sold_id>", methods=["DELETE"])
@require_auth
def delete_sold_data(sold_id):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(f"DELETE FROM sold_data WHERE id = {p} AND user_id = {p}", (sold_id, g.user_id))
        if cursor.rowcount != 1:
            return jsonify({"success": False, "message": "Sold record not found"}), 404
        conn.commit()
        return jsonify({"success": True, "message": "Sold data deleted successfully"})
    finally:
        conn.close()

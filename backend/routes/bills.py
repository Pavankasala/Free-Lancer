import math
import uuid
from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth


bills_bp = Blueprint("bills", __name__)


def _number(value, field: str, *, minimum: float = 0.0) -> float:
    try:
        number = float(value or 0)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number")
    if not math.isfinite(number) or number < minimum:
        raise ValueError(f"{field} must be at least {minimum}")
    return number


def _items_from_payload(data):
    raw_items = data.get("items")
    if raw_items is None:
        raw_items = [{"bags": data.get("no_of_bags"), "price": data.get("price")}]
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("At least one bill item is required")

    items = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        try:
            bags = int(_number(item.get("bags", item.get("no_of_bags")), "Bags"))
            price = _number(item.get("price"), "Price")
        except ValueError:
            continue
        if bags > 0 and price >= 0:
            items.append(
                {
                    "bags": bags,
                    "price": price,
                    "kisan_name": str(item.get("kisanName") or item.get("sourceKisanName") or "").strip(),
                }
            )
    if not items:
        raise ValueError("At least one bill item with valid Bags and Price is required")
    return items


def _group_rows(rows):
    """Convert persisted line items into the bill objects the frontend consumes."""
    groups = {}
    ordered_group_keys = []
    for raw_row in rows:
        row = dict(raw_row)
        group_key = row.get("bill_group_id") or f"legacy-{row['id']}"
        if group_key not in groups:
            bill = row.copy()
            bill["channels"] = []
            bill["line_item_ids"] = []
            bill["no_of_bags"] = 0
            bill["total_amount"] = 0.0
            bill["advance"] = 0.0
            bill["confirmed"] = bool(row.get("confirmed"))
            groups[group_key] = bill
            ordered_group_keys.append(group_key)

        bill = groups[group_key]
        bags = int(row.get("no_of_bags") or 0)
        price = float(row.get("price") or 0)
        bill["channels"].append(
            {
                "id": row["id"],
                "bags": bags,
                "price": price,
                "kisanName": row.get("source_kisan_name") or "",
            }
        )
        bill["line_item_ids"].append(row["id"])
        bill["no_of_bags"] += bags
        bill["total_amount"] += bags * price
        bill["advance"] += float(row.get("advance") or 0)
        bill["confirmed"] = bool(bill["confirmed"] or row.get("confirmed"))
        if row.get("paid") == "YES":
            bill["paid"] = "YES"

    result = []
    for group_key in ordered_group_keys:
        bill = groups[group_key]
        bill["price"] = bill["total_amount"] / bill["no_of_bags"] if bill["no_of_bags"] else 0.0
        gross = bill["total_amount"]
        hamali_val = float(bill.get("hamali") or 0.0)
        bill_type = bill.get("type", "")
        if bill_type == "BUY":
            commission_val = round(gross * 0.04)
            damage_val = round(gross * 0.06)
            bill["net_amount"] = max(0.0, gross - commission_val - hamali_val - damage_val)
        else:
            # BUYER: no deductions, net = gross
            bill["net_amount"] = gross
        result.append(bill)
    return result


def _save_bill_lines(cursor, *, user_id, bill_type, bill_group_id, name, bill_date, bill_time, items, hamali, advance, paid, payment_mode=None):
    p = db.ph()
    for index, item in enumerate(items):
        cursor.execute(
            f"""
            INSERT INTO inventory (
                user_id, bill_group_id, name, source_kisan_name, no_of_bags, price,
                date, time, type, advance, hamali, paid, confirmed, payment_mode
            )
            VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
            """,
            (
                user_id,
                bill_group_id,
                name,
                item["kisan_name"] or None,
                item["bags"],
                item["price"],
                bill_date,
                bill_time,
                bill_type,
                advance if index == 0 else 0.0,
                hamali,
                paid,
                paid == "YES",
                payment_mode,
            ),
        )


def _find_owned_bill(cursor, bill_id, bill_type):
    p = db.ph()
    cursor.execute(
        f"SELECT * FROM inventory WHERE id = {p} AND user_id = {p} AND type = {p}",
        (bill_id, g.user_id, bill_type),
    )
    row = cursor.fetchone()
    if not row:
        cursor.execute(
            f"SELECT * FROM inventory WHERE bill_group_id = {p} AND user_id = {p} AND type = {p} ORDER BY id LIMIT 1",
            (str(bill_id), g.user_id, bill_type),
        )
        row = cursor.fetchone()
    return row


def _delete_bill_group(cursor, row, bill_type):
    p = db.ph()
    row_dict = dict(row)
    if row_dict.get("bill_group_id"):
        cursor.execute(
            f"DELETE FROM inventory WHERE user_id = {p} AND bill_group_id = {p} AND type = {p}",
            (g.user_id, row_dict["bill_group_id"], bill_type),
        )
    else:
        cursor.execute(
            f"DELETE FROM inventory WHERE id = {p} AND user_id = {p} AND type = {p}",
            (row_dict["id"], g.user_id, bill_type),
        )


def _get_bills_for_type(bill_type, date=None):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        params = [g.user_id, bill_type]
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = {p}"
        if date:
            query += f" AND date = {p}"
            params.append(date)
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        return _group_rows(cursor.fetchall())
    finally:
        conn.close()



@bills_bp.route("/api/mark-bill-paid/<int:bill_id>", methods=["POST"])
@require_auth
def mark_bill_paid(bill_id):
    """Toggle paid status (YES/NO) for a BUY or BUYER bill."""
    data = request.get_json(silent=True) or {}
    paid_val = str(data.get("paid", "YES")).upper()
    if paid_val not in ("YES", "NO"):
        paid_val = "YES"
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        # Fetch the bill to get its group id
        cursor.execute(
            f"SELECT bill_group_id, type FROM inventory WHERE id = {p} AND user_id = {p}",
            (bill_id, g.user_id),
        )
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Bill not found"}), 404
        row_dict = dict(row)
        grp_id = row_dict.get("bill_group_id")
        if grp_id:
            cursor.execute(
                f"UPDATE inventory SET paid = {p}, confirmed = {p} WHERE bill_group_id = {p} AND user_id = {p}",
                (paid_val, paid_val == "YES", grp_id, g.user_id),
            )
        else:
            cursor.execute(
                f"UPDATE inventory SET paid = {p}, confirmed = {p} WHERE id = {p} AND user_id = {p}",
                (paid_val, paid_val == "YES", bill_id, g.user_id),
            )
        conn.commit()
        return jsonify({"success": True, "message": f"Bill marked as {paid_val}"})
    finally:
        conn.close()


@bills_bp.route("/api/home-bills", methods=["GET"])
@bills_bp.route("/home-bills", methods=["GET"])
@require_auth
def get_home_bills():
    date = request.args.get("date")
    bills = _get_bills_for_type("BUY", date)
    return jsonify({"success": True, "bills": bills, "date": date})


@bills_bp.route("/api/add-bill", methods=["POST"])
@require_auth
def add_bill():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Kisan name is required"}), 400

    try:
        items = _items_from_payload(data)
        hamali = _number(data.get("hamali", 0), "Hamali")
        advance = _number(data.get("advance", 0), "Advance")
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400

    bill_date = str(data.get("billdate") or data.get("date") or datetime.now().strftime("%Y-%m-%d"))
    bill_time = str(data.get("time") or data.get("advanceTime") or datetime.now().strftime("%I:%M %p"))
    total = sum(item["bags"] * item["price"] for item in items)
    paid = "YES" if total > 0 and advance >= total else "NO"
    bill_group_id = uuid.uuid4().hex

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        _save_bill_lines(
            cursor,
            user_id=g.user_id,
            bill_type="BUY",
            bill_group_id=bill_group_id,
            name=name,
            bill_date=bill_date,
            bill_time=bill_time,
            items=items,
            hamali=hamali,
            advance=advance,
            paid=paid,
        )
        conn.commit()
        return jsonify({"success": True, "message": "Bill added successfully", "bill_group_id": bill_group_id}), 200
    finally:
        conn.close()


@bills_bp.route("/api/update-bill/<int:bill_id>", methods=["PUT"])
@require_auth
def update_bill(bill_id):
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Kisan name is required"}), 400
    try:
        items = _items_from_payload(data)
        hamali = _number(data.get("hamali", 0), "Hamali")
        advance = _number(data.get("advance", 0), "Advance")
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        existing = _find_owned_bill(cursor, bill_id, "BUY")
        if not existing:
            return jsonify({"success": False, "message": "Bill not found"}), 404

        existing_dict = dict(existing)
        total = sum(item["bags"] * item["price"] for item in items)
        paid = "YES" if total > 0 and advance >= total else "NO"
        group_id = existing_dict.get("bill_group_id") or uuid.uuid4().hex

        # Preserve the original row id for single-row purchases. Grouped bills follow
        # the legacy delete-and-reinsert flow because their rows are intentionally
        # treated as a shared bill group.
        if existing_dict.get("bill_group_id"):
            cursor.execute(
                f"SELECT * FROM inventory WHERE user_id = {db.ph()} AND bill_group_id = {db.ph()} AND type = 'BUY' ORDER BY id",
                (g.user_id, group_id),
            )
            group_rows = cursor.fetchall()
            if len(group_rows) == 1:
                row = dict(group_rows[0])
                cursor.execute(
                    f"""
                    UPDATE inventory
                    SET name = {db.ph()}, source_kisan_name = {db.ph()}, no_of_bags = {db.ph()}, price = {db.ph()},
                        date = {db.ph()}, time = {db.ph()}, advance = {db.ph()}, hamali = {db.ph()},
                        paid = {db.ph()}, confirmed = {db.ph()}
                    WHERE id = {db.ph()} AND user_id = {db.ph()} AND type = 'BUY'
                    """,
                    (
                        name,
                        items[0]["kisan_name"] or None,
                        items[0]["bags"],
                        items[0]["price"],
                        str(data.get("date") or data.get("billdate") or row.get("date") or ""),
                        str(data.get("time") or row.get("time") or "12:00 PM"),
                        advance,
                        hamali,
                        paid,
                        paid == "YES",
                        row["id"],
                        g.user_id,
                    ),
                )
                conn.commit()
                return jsonify({"success": True, "message": "Bill updated successfully"})

        _delete_bill_group(cursor, existing, "BUY")
        _save_bill_lines(
            cursor,
            user_id=g.user_id,
            bill_type="BUY",
            bill_group_id=group_id,
            name=name,
            bill_date=str(data.get("date") or data.get("billdate") or existing_dict.get("date") or ""),
            bill_time=str(data.get("time") or existing_dict.get("time") or "12:00 PM"),
            items=items,
            hamali=hamali,
            advance=advance,
            paid=paid,
        )
        conn.commit()
        return jsonify({"success": True, "message": "Bill updated successfully"})
    finally:
        conn.close()


@bills_bp.route("/api/confirm-bill/<int:bill_id>", methods=["POST"])
@require_auth
def confirm_bill(bill_id):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        existing = _find_owned_bill(cursor, bill_id, "BUY")
        if not existing:
            return jsonify({"success": False, "message": "Bill not found"}), 404
        existing_dict = dict(existing)
        p = db.ph()
        if existing_dict.get("bill_group_id"):
            cursor.execute(
                f"UPDATE inventory SET paid = 'YES', confirmed = {p} WHERE user_id = {p} AND bill_group_id = {p} AND type = 'BUY'",
                (True, g.user_id, existing_dict["bill_group_id"]),
            )
        else:
            cursor.execute(
                f"UPDATE inventory SET paid = 'YES', confirmed = {p} WHERE id = {p} AND user_id = {p} AND type = 'BUY'",
                (True, bill_id, g.user_id),
            )
        conn.commit()
        return jsonify({"success": True, "message": "Bill confirmed as paid"})
    finally:
        conn.close()


@bills_bp.route("/api/delete-bill/<int:bill_id>", methods=["DELETE"])
@require_auth
def delete_bill(bill_id):
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"SELECT * FROM inventory WHERE id = {p} AND user_id = {p} AND type IN ('BUY', 'BUYER')",
            (bill_id, g.user_id),
        )
        existing = cursor.fetchone()
        if not existing:
            return jsonify({"success": False, "message": "Bill not found"}), 404
        _delete_bill_group(cursor, existing, dict(existing)["type"])
        conn.commit()
        return jsonify({"success": True, "message": "Bill deleted successfully"})
    finally:
        conn.close()


@bills_bp.route("/api/buyer-bills", methods=["GET"])
@require_auth
def get_buyer_bills():
    date = request.args.get("date")
    bills = _get_bills_for_type("BUYER", date)
    return jsonify({"success": True, "bills": bills, "date": date})


def _save_buyer_bill(bill_id=None):
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Buyer name is required"}), 400
    try:
        items = _items_from_payload(data)
        hamali = _number(data.get("hamali", 0), "Hamali")
        advance = _number(data.get("advance", 0), "Advance")
    except ValueError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400

    payment_mode = str(data.get("paymentMode") or data.get("payment_mode") or "CASH").strip().upper()[:30]
    paid = "YES" if str(data.get("paid") or "").upper() == "YES" else "NO"
    bill_date = str(data.get("billdate") or data.get("date") or datetime.now().strftime("%Y-%m-%d"))
    bill_time = str(data.get("time") or data.get("advanceTime") or datetime.now().strftime("%I:%M %p"))

    conn = db.get_db()
    try:
        cursor = conn.cursor()
        group_id = uuid.uuid4().hex
        if bill_id is not None:
            existing = _find_owned_bill(cursor, bill_id, "BUYER")
            if not existing:
                return jsonify({"success": False, "message": "Buyer bill not found"}), 404
            group_id = dict(existing).get("bill_group_id") or group_id
            _delete_bill_group(cursor, existing, "BUYER")

        _save_bill_lines(
            cursor,
            user_id=g.user_id,
            bill_type="BUYER",
            bill_group_id=group_id,
            name=name,
            bill_date=bill_date,
            bill_time=bill_time,
            items=items,
            hamali=hamali,
            advance=advance,
            paid=paid,
            payment_mode=payment_mode,
        )
        conn.commit()
        message = "Buyer bill updated successfully" if bill_id is not None else "Buyer bill saved successfully"
        return jsonify({"success": True, "message": message, "bill_group_id": group_id}), 200
    finally:
        conn.close()


@bills_bp.route("/api/add-buyer-bill", methods=["POST"])
@require_auth
def add_buyer_bill():
    return _save_buyer_bill()


@bills_bp.route("/api/update-buyer-bill/<int:bill_id>", methods=["PUT"])
@require_auth
def update_buyer_bill(bill_id):
    return _save_buyer_bill(bill_id)


@bills_bp.route("/api/not-paid-bills", methods=["GET"])
@require_auth
def get_not_paid_bills():
    year = request.args.get("year", "").strip()
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'BUY' AND (paid IS NULL OR paid != 'YES')"
        params = [g.user_id]
        if year:
            query += f" AND date LIKE {p}"
            params.append(f"{year}%")
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "bills": _group_rows(cursor.fetchall())})
    finally:
        conn.close()


@bills_bp.route("/api/paid-bills", methods=["GET"])
@require_auth
def get_paid_bills():
    date = request.args.get("date")
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'BUY' AND paid = 'YES'"
        params = [g.user_id]
        if date:
            query += f" AND date = {p}"
            params.append(date)
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        return jsonify({"success": True, "bills": _group_rows(cursor.fetchall())})
    finally:
        conn.close()

from datetime import datetime

from flask import Blueprint, g, jsonify, request

import db
from security import require_auth
from .bills import _group_rows


balance_bp = Blueprint("balance", __name__)


def _value(row, key):
    return float((dict(row) if row else {}).get(key) or 0)


@balance_bp.route("/api/balance-sheet", methods=["GET"])
@require_auth
def get_balance_sheet():
    """Return a user-owned operational summary for one business date."""
    selected_date = request.args.get("date") or datetime.now().strftime("%Y-%m-%d")
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        cursor.execute(
            f"""
            SELECT COALESCE(SUM(no_of_bags * price), 0) AS total_buy, COALESCE(SUM(no_of_bags), 0) AS total_bags
            FROM inventory WHERE user_id = {p} AND date = {p} AND type = 'BUY'
            """,
            (g.user_id, selected_date),
        )
        buy = cursor.fetchone()
        cursor.execute(
            f"SELECT COALESCE(SUM(amount), 0) AS total_exp FROM expenditures WHERE user_id = {p} AND date = {p}",
            (g.user_id, selected_date),
        )
        expenses = cursor.fetchone()
        cursor.execute(
            f"SELECT COALESCE(SUM(amount), 0) AS total_cash FROM cash_collection WHERE user_id = {p} AND date = {p}",
            (g.user_id, selected_date),
        )
        cash = cursor.fetchone()
        cursor.execute(
            f"SELECT COALESCE(SUM(no_of_bags * price), 0) AS total_sales FROM inventory WHERE user_id = {p} AND date = {p} AND type = 'SELL'",
            (g.user_id, selected_date),
        )
        sales = cursor.fetchone()
        return jsonify(
            {
                "success": True,
                "date": selected_date,
                "total_buy": _value(buy, "total_buy"),
                "total_bags": int(_value(buy, "total_bags")),
                "total_expenditures": _value(expenses, "total_exp"),
                "total_cash": _value(cash, "total_cash"),
                "total_sales": _value(sales, "total_sales"),
            }
        )
    finally:
        conn.close()


@balance_bp.route("/api/kisan-balance", methods=["GET"])
@require_auth
def get_kisan_balance():
    name = request.args.get("name", "").strip()
    year = request.args.get("year", datetime.now().strftime("%Y")).strip()
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'BUY'"
        params = [g.user_id]
        if name:
            query += f" AND LOWER(name) LIKE {p}"
            params.append(f"%{name.lower()}%")
        if year:
            query += f" AND date LIKE {p}"
            params.append(f"{year}%")
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        records = _group_rows(cursor.fetchall())

        total_gross = 0.0
        total_net = 0.0
        total_advance = 0.0
        total_pending = 0.0

        for record in records:
            gross = float(record.get("total_amount") or 0.0)
            net = float(record.get("net_amount") if record.get("net_amount") is not None else gross)
            adv = float(record.get("advance") or 0.0)
            is_paid = (record.get("paid") == "YES") or (net > 0 and adv >= net)
            record["paid"] = "YES" if is_paid else "NO"
            record["cash_paid"] = net if is_paid else adv
            pending = 0.0 if is_paid else max(net - adv, 0.0)
            record["pending_balance"] = pending

            total_gross += gross
            total_net += net
            total_advance += adv
            total_pending += pending

        return jsonify(
            {
                "success": True,
                "records": records,
                "summary": {
                    "total_amount": total_gross,
                    "net_amount": total_net,
                    "cash_paid": total_advance,
                    "pending_balance": total_pending,
                },
            }
        )
    finally:
        conn.close()


@balance_bp.route("/api/buyer-balance", methods=["GET"])
@require_auth
def get_buyer_balance():
    name = request.args.get("name", "").strip()
    year = request.args.get("year", datetime.now().strftime("%Y")).strip()
    conn = db.get_db()
    try:
        cursor = conn.cursor()
        p = db.ph()
        query = f"SELECT * FROM inventory WHERE user_id = {p} AND type = 'BUYER'"
        params = [g.user_id]
        if name:
            query += f" AND LOWER(name) LIKE {p}"
            params.append(f"%{name.lower()}%")
        if year:
            query += f" AND date LIKE {p}"
            params.append(f"{year}%")
        query += " ORDER BY id DESC"
        cursor.execute(query, tuple(params))
        records = _group_rows(cursor.fetchall())

        total_amount = 0.0
        cash_paid = 0.0
        pending_balance = 0.0

        for record in records:
            gross = float(record.get("total_amount") or 0.0)
            net = float(record.get("net_amount") if record.get("net_amount") is not None else gross)
            adv = float(record.get("advance") or 0.0)
            is_paid = (record.get("paid") == "YES") or (net > 0 and adv >= net)
            record["paid"] = "YES" if is_paid else "NO"
            paid_amount = net if is_paid else adv
            pending = 0.0 if is_paid else max(net - adv, 0.0)
            record["cash_paid"] = paid_amount
            record["pending_balance"] = pending

            total_amount += gross
            cash_paid += paid_amount
            pending_balance += pending

        return jsonify(
            {
                "success": True,
                "records": records,
                "summary": {
                    "total_amount": total_amount,
                    "cash_paid": cash_paid,
                    "pending_balance": pending_balance,
                },
            }
        )
    finally:
        conn.close()

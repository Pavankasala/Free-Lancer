import os
import sys
import datetime
import db

def seed_dummy_data():
    conn = db.get_db()
    cursor = conn.cursor()
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    p = db.ph()

    print(f"Seeding dummy testing records for date: {today}...")

    # Insert sample farmer bills for today
    sample_bills = [
        ('Ramesh Kumar', 25, 450.0, today, '10:15 AM', 'BUY', 500.0, 10.0, 'NO'),
        ('Suresh Reddy', 40, 520.0, today, '11:30 AM', 'BUY', 1000.0, 10.0, 'NO'),
        ('Mahesh Sharma', 15, 480.0, today, '02:45 PM', 'BUY', 0.0, 10.0, 'YES')
    ]
    for b in sample_bills:
        cursor.execute(f'''
            INSERT INTO inventory (name, no_of_bags, price, date, time, type, advance, hamali, paid)
            VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
        ''', b)
    print("-> Seeded 3 sample farmer bills for today.")

    # Seed Expenditures for today
    sample_exp = [
        (today, 'Lorry Freight Charges', 1200.0),
        (today, 'Tea & Labour Expenses', 250.0),
        (today, 'Packing Net Bags', 850.0)
    ]
    for e in sample_exp:
        cursor.execute(f'''
            INSERT INTO expenditures (date, description, amount)
            VALUES ({p}, {p}, {p})
        ''', e)
    print("-> Seeded 3 sample expenditures for today.")

    # Seed Cash Collections for today
    sample_cash = [
        (today, 5000.0, 'Venkateshwara Fruits'),
        (today, 8500.0, 'Krishna Traders')
    ]
    for c in sample_cash:
        cursor.execute(f'''
            INSERT INTO cash_collection (date, amount, given_by)
            VALUES ({p}, {p}, {p})
        ''', c)
    print("-> Seeded 2 sample cash collection records for today.")

    # Seed Shops if empty
    cursor.execute("SELECT COUNT(*) FROM shops")
    if cursor.fetchone()[0] == 0:
        sample_shops = [
            ('Sri Rama Lemon Traders', 'Nakrekal', '9848022334'),
            ('Hyderabad Fruit Mandi', 'Kothapet, Hyderabad', '9988776655'),
            ('Vijayawada Agricultural Market', 'Vijayawada', '9123456789')
        ]
        for s in sample_shops:
            cursor.execute(f'''
                INSERT INTO shops (name, city, mobile)
                VALUES ({p}, {p}, {p})
            ''', s)
        print("-> Seeded 3 sample buyer shops.")

    conn.commit()
    conn.close()
    print("Dummy test database ready for today's testing!")

if __name__ == '__main__':
    seed_dummy_data()

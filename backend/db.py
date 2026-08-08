import os
import sqlite3
import hashlib
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    if DATABASE_URL:
        import psycopg2
        import psycopg2.extras
        # Connect to Neon PostgreSQL cloud database
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        return conn
    else:
        # Fallback to local SQLite database
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'lemons.db'))
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    if DATABASE_URL:
        # Neon PostgreSQL Schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "user" (
                user_id SERIAL PRIMARY KEY,
                user_name VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                user_type VARCHAR(20),
                name VARCHAR(100),
                company_name VARCHAR(200),
                company_full_name VARCHAR(250),
                mobile VARCHAR(50),
                commission REAL DEFAULT 5.0,
                less_for_damages REAL DEFAULT 0.0,
                icf REAL DEFAULT 1.0,
                default_hamali REAL DEFAULT 10.0,
                license_expires_on VARCHAR(50)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                no_of_bags INT DEFAULT 0,
                village VARCHAR(100),
                date VARCHAR(50),
                time VARCHAR(50),
                type VARCHAR(50),
                price REAL DEFAULT 0.0,
                transportation_charges REAL DEFAULT 0.0,
                lorry_no VARCHAR(50),
                tons VARCHAR(50),
                enam REAL DEFAULT 0.0,
                lorry_advance REAL DEFAULT 0.0,
                sold_to VARCHAR(100),
                hamali REAL DEFAULT 0.0,
                remote_commission REAL DEFAULT 0.0,
                advance REAL DEFAULT 0.0,
                paid VARCHAR(10) DEFAULT 'NO'
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenditures (
                id SERIAL PRIMARY KEY,
                date VARCHAR(50),
                description TEXT,
                amount REAL DEFAULT 0.0
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cash_collection (
                id SERIAL PRIMARY KEY,
                date VARCHAR(50),
                amount REAL DEFAULT 0.0,
                given_by VARCHAR(100)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shops (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                city VARCHAR(100),
                mobile VARCHAR(50)
            );
        ''')
        # Check admin
        cursor.execute("SELECT * FROM \"user\" WHERE user_name = 'admin'")
        if not cursor.fetchone():
            pwd_hash = hashlib.md5("admin".encode()).hexdigest()
            cursor.execute('''
                INSERT INTO "user" (user_name, password, user_type, name, company_name, company_full_name, mobile, commission, less_for_damages, icf, default_hamali, license_expires_on)
                VALUES ('admin', %s, 'OPE', 'Operator', 'S.L.C Lemon Company', 'Lemon & Fruit Exports Commission Agent', '9866123445', 5.0, 0.0, 1.0, 10.0, '2030-12-31')
            ''', (pwd_hash,))
        conn.commit()
        conn.close()
    else:
        # SQLite Schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT UNIQUE,
                password TEXT,
                user_type TEXT,
                name TEXT,
                company_name TEXT,
                company_full_name TEXT,
                mobile TEXT,
                commission REAL DEFAULT 5.0,
                less_for_damages REAL DEFAULT 0.0,
                icf REAL DEFAULT 1.0,
                default_hamali REAL DEFAULT 10.0,
                license_expires_on TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                no_of_bags INTEGER DEFAULT 0,
                village TEXT,
                date TEXT,
                time TEXT,
                type TEXT,
                price REAL DEFAULT 0.0,
                transportation_charges REAL DEFAULT 0.0,
                lorry_no TEXT,
                tons TEXT,
                enam REAL DEFAULT 0.0,
                lorry_advance REAL DEFAULT 0.0,
                sold_to TEXT,
                hamali REAL DEFAULT 0.0,
                remote_commission REAL DEFAULT 0.0,
                advance REAL DEFAULT 0.0,
                paid TEXT DEFAULT 'NO'
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenditures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                description TEXT,
                amount REAL DEFAULT 0.0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cash_collection (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                amount REAL DEFAULT 0.0,
                given_by TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                city TEXT,
                mobile TEXT
            )
        ''')
        # Migration for time column if inventory table already exists
        try:
            cursor.execute("ALTER TABLE inventory ADD COLUMN time TEXT")
        except sqlite3.OperationalError:
            pass

        cursor.execute("UPDATE inventory SET time = '11:35 PM' WHERE time IS NULL OR time = ''")

        # Seed default Admin
        cursor.execute("SELECT * FROM user WHERE user_name = 'admin'")
        if not cursor.fetchone():
            pwd_hash = hashlib.md5("admin".encode()).hexdigest()
            cursor.execute('''
                INSERT INTO user (user_name, password, user_type, name, company_name, company_full_name, mobile, commission, less_for_damages, icf, default_hamali, license_expires_on)
                VALUES ('admin', ?, 'OPE', 'Operator', 'S.L.C Lemon Company', 'Lemon & Fruit Exports Commission Agent', '9866123445', 5.0, 0.0, 1.0, 10.0, '2030-12-31')
            ''', (pwd_hash,))

        conn.commit()
        conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully!")

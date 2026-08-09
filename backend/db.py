import os
import sqlite3
import hashlib
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

# Try top-level database driver import for PostgreSQL
psycopg2 = None
psycopg2_extras = None
try:
    import psycopg2
    import psycopg2.extras as psycopg2_extras
except ImportError:
    pass

def get_db():
    if DATABASE_URL:
        # Enforce sslmode=require for Neon PostgreSQL connection pooler if missing
        conn_str = DATABASE_URL
        if 'sslmode' not in conn_str and 'localhost' not in conn_str and '127.0.0.1' not in conn_str:
            conn_str += '?sslmode=require' if '?' not in conn_str else '&sslmode=require'

        if psycopg2 and psycopg2_extras:
            return psycopg2.connect(conn_str, cursor_factory=psycopg2_extras.RealDictCursor)
        else:
            # Fallback import if psycopg2 imported dynamically
            import psycopg2 as pg_driver
            import psycopg2.extras as pg_extras
            return pg_driver.connect(conn_str, cursor_factory=pg_extras.RealDictCursor)
    else:
        # Local SQLite database
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'lemons.db'))
        conn.row_factory = sqlite3.Row
        return conn

def ph():
    """Returns %s for PostgreSQL and ? for SQLite"""
    return "%s" if DATABASE_URL else "?"

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    if DATABASE_URL:
        # PostgreSQL Schema for Neon
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "user" (
                user_id SERIAL PRIMARY KEY,
                user_name VARCHAR(100) UNIQUE,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                user_type VARCHAR(20) DEFAULT 'OPE',
                name VARCHAR(100),
                company_name VARCHAR(200),
                company_full_name VARCHAR(250),
                mobile VARCHAR(50),
                address TEXT,
                commission REAL DEFAULT 5.0,
                less_for_damages REAL DEFAULT 0.0,
                icf REAL DEFAULT 1.0,
                default_hamali REAL DEFAULT 10.0,
                license_expires_on VARCHAR(50),
                auth_provider VARCHAR(50) DEFAULT 'LOCAL'
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                user_id INT,
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
                paid VARCHAR(10) DEFAULT 'NO',
                confirmed BOOLEAN DEFAULT FALSE
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sold_data (
                id SERIAL PRIMARY KEY,
                user_id INT,
                date VARCHAR(50),
                name VARCHAR(100),
                sold_to VARCHAR(100),
                no_of_bags INT DEFAULT 0,
                hamali_per_bag REAL DEFAULT 0.0,
                party_commission VARCHAR(50),
                lorry_no VARCHAR(50),
                lorry_charges REAL DEFAULT 0.0,
                tons REAL DEFAULT 0.0,
                enam VARCHAR(100),
                lorry_advance REAL DEFAULT 0.0,
                village_ref VARCHAR(150)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS kisans (
                id SERIAL PRIMARY KEY,
                user_id INT,
                name VARCHAR(100),
                mobile VARCHAR(50)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenditures (
                id SERIAL PRIMARY KEY,
                user_id INT,
                date VARCHAR(50),
                description TEXT,
                amount REAL DEFAULT 0.0
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cash_collection (
                id SERIAL PRIMARY KEY,
                user_id INT,
                date VARCHAR(50),
                amount REAL DEFAULT 0.0,
                given_by VARCHAR(100)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shops (
                id SERIAL PRIMARY KEY,
                user_id INT,
                name VARCHAR(100),
                city VARCHAR(100),
                mobile VARCHAR(50)
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sms_logs (
                id SERIAL PRIMARY KEY,
                user_id INT,
                date VARCHAR(50),
                mobile VARCHAR(50),
                message TEXT,
                status VARCHAR(50) DEFAULT 'SENT'
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bags_config (
                id SERIAL PRIMARY KEY,
                user_id INT,
                bag_type VARCHAR(100),
                capacity VARCHAR(50)
            );
        ''')

        # PostgreSQL Column Migrations for pre-existing tables
        pg_alters = [
            "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
            "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS address TEXT",
            "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'LOCAL'",
            "ALTER TABLE inventory ADD COLUMN IF NOT EXISTS user_id INT",
            "ALTER TABLE inventory ADD COLUMN IF NOT EXISTS time VARCHAR(50)",
            "ALTER TABLE inventory ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE",
            "ALTER TABLE sold_data ADD COLUMN IF NOT EXISTS user_id INT",
            "ALTER TABLE expenditures ADD COLUMN IF NOT EXISTS user_id INT",
            "ALTER TABLE cash_collection ADD COLUMN IF NOT EXISTS user_id INT"
        ]
        for alter in pg_alters:
            try:
                cursor.execute(alter)
            except Exception:
                pass
        conn.commit()
        
        # Seed default Admin user if not exists
        try:
            cursor.execute("SELECT * FROM \"user\" WHERE LOWER(user_name) = 'admin' OR (email IS NOT NULL AND LOWER(email) = 'admin@agricommission.com')")
            if not cursor.fetchone():
                pwd_hash = hashlib.md5("admin".encode()).hexdigest()
                cursor.execute('''
                    INSERT INTO "user" (user_name, email, password, user_type, name, company_name, company_full_name, mobile, commission, default_hamali, license_expires_on)
                    VALUES ('admin', 'admin@agricommission.com', %s, 'OPE', 'Operator', 'S.L.C Lemon Company', 'Lemon & Fruit Exports Commission Agent', '9866123445', 5.0, 10.0, '2030-12-31')
                ''', (pwd_hash,))
            conn.commit()
        except Exception:
            pass

        conn.close()
    else:
        # SQLite Schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                user_type TEXT DEFAULT 'OPE',
                name TEXT,
                company_name TEXT,
                company_full_name TEXT,
                mobile TEXT,
                address TEXT,
                commission REAL DEFAULT 5.0,
                less_for_damages REAL DEFAULT 0.0,
                icf REAL DEFAULT 1.0,
                default_hamali REAL DEFAULT 10.0,
                license_expires_on TEXT,
                auth_provider TEXT DEFAULT 'LOCAL'
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
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
                paid TEXT DEFAULT 'NO',
                confirmed INTEGER DEFAULT 0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sold_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                name TEXT,
                sold_to TEXT,
                no_of_bags INTEGER DEFAULT 0,
                hamali_per_bag REAL DEFAULT 0.0,
                party_commission TEXT,
                lorry_no TEXT,
                lorry_charges REAL DEFAULT 0.0,
                tons REAL DEFAULT 0.0,
                enam TEXT,
                lorry_advance TEXT DEFAULT 0.0,
                village_ref TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS kisans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                mobile TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS expenditures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                description TEXT,
                amount REAL DEFAULT 0.0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cash_collection (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                amount REAL DEFAULT 0.0,
                given_by TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS shops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                city TEXT,
                mobile TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sms_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                mobile TEXT,
                message TEXT,
                status TEXT DEFAULT 'SENT'
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bags_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                bag_type TEXT,
                capacity TEXT
            )
        ''')

        # Migrations
        for alter in [
            "ALTER TABLE user ADD COLUMN email TEXT",
            "ALTER TABLE user ADD COLUMN address TEXT",
            "ALTER TABLE user ADD COLUMN auth_provider TEXT DEFAULT 'LOCAL'",
            "ALTER TABLE inventory ADD COLUMN user_id INTEGER",
            "ALTER TABLE inventory ADD COLUMN time TEXT",
            "ALTER TABLE inventory ADD COLUMN confirmed INTEGER DEFAULT 0",
            "ALTER TABLE sold_data ADD COLUMN user_id INTEGER",
            "ALTER TABLE expenditures ADD COLUMN user_id INTEGER",
            "ALTER TABLE cash_collection ADD COLUMN user_id INTEGER"
        ]:
            try:
                cursor.execute(alter)
            except sqlite3.OperationalError:
                pass

        cursor.execute("UPDATE inventory SET time = '12:00 PM' WHERE time IS NULL OR time = ''")

        # Seed default Admin
        cursor.execute("SELECT * FROM user WHERE LOWER(user_name) = 'admin' OR (email IS NOT NULL AND LOWER(email) = 'admin@agricommission.com')")
        if not cursor.fetchone():
            pwd_hash = hashlib.md5("admin".encode()).hexdigest()
            cursor.execute('''
                INSERT INTO user (user_name, email, password, user_type, name, company_name, company_full_name, mobile, commission, default_hamali, license_expires_on)
                VALUES ('admin', 'admin@agricommission.com', ?, 'OPE', 'Operator', 'S.L.C Lemon Company', 'Lemon & Fruit Exports Commission Agent', '9866123445', 5.0, 10.0, '2030-12-31')
            ''', (pwd_hash,))

        conn.commit()
        conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully with clean imports!")

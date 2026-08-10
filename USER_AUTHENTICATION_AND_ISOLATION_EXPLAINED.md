# 🔐 User Authentication, Identification & Data Isolation Explained

This document explains how user identification, authentication, JWT tokens, Google login, and database isolation work in the **Agri Commission Manager** application.

---

## 💡 1. How Do We Differentiate Between Users?

In database and software design, we use **two levels of identification**:

### Level A: Unique Identity Fields (`email` & `user_name`)
- Both `email` and `user_name` are set as **`UNIQUE` constraints** in the database.
- This guarantees that **no two users can ever register with the same email address or username**.

### Level B: Primary Key (`user_id`) — The Core Connector
- Even though `email` is unique, the system identifies every user using an integer ID called **`user_id`** (e.g., `1`, `2`, `3`, `4`).
- **Why use `user_id` (an integer) instead of `email` (a text string) for data links?**
  1. **Performance & Speed**: Searching numbers in databases is fast and lightweight (takes only 4 bytes of RAM per row).
  2. **Flexibility**: If a user updates their email address in the future, their `user_id` never changes. None of their financial bills, advances, or sales get disconnected or broken!

---

## 🔑 2. How Password Authentication Works (bcrypt + Salting)

When a user signs up or logs in with an email & password:
1. **Password Hashing**: We never store plain text passwords like `"mysecret123"`.
2. **`bcrypt` with Salt**: `bcrypt` automatically generates a unique random string (called a **salt**) and combines it with the password to generate a secure hash string like `$2b$12$Kix...`.
3. **Verification**: During login, `bcrypt.checkpw()` takes the typed password, applies the salt, and checks if it matches the stored hash.

---

## 🌐 3. How Google Authentication Works & Google Tokens

1. **User Clicks "Continue with Google"**: Google opens a secure popup window.
2. **Google Verifies Identity**: The user logs in on Google's official servers.
3. **Google Token Returned**: Google returns a signed **Google Token** (`access_token` / `id_token`) to your React frontend.
4. **Backend Validation**: Your backend sends the token/credential to Google to verify its signature and verify the account email.

---

## 🔗 4. What Happens When `Email == Google Email`? (Account Linking)

If a user signs up with `pavan@gmail.com` using email/password, and later clicks **"Continue with Google"** using `pavan@gmail.com`:

```text
[ Google Sign-In Request: pavan@gmail.com ]
                      │
                      ▼
[ Flask Backend: SELECT * FROM "user" WHERE email = 'pavan@gmail.com' ]
                      │
            ┌─────────┴─────────┐
            │ Account Exists?   │
            └─────────┬─────────┘
                      │ YES
                      ▼
[ Matches existing user_id = 15 ]
[ Updates auth_provider = 'LOCAL,GOOGLE' ]
[ Returns JWT Token for user_id = 15 ]
```

- **Result**: You land in your **exact same account** (`user_id = 15`). All your bills, advances, and reports are preserved, and no duplicate account is created!

---

## 🎟️ 5. How JWT Tokens Work (Your App's Passport)

After successful login (whether via Email/Password or Google), the backend issues your app's **JWT Access Token**:

```json
{
  "sub": "15",
  "iat": 1770732000,
  "exp": 1770818400
}
```

- The payload contains `"sub": "15"` (the `user_id`).
- The token is cryptographically signed using your server's `JWT_SECRET_KEY`. No client can fake or tamper with this token.

---

## 🛡️ 6. How Data Isolation Works (Database Queries)

Every database table in your Neon PostgreSQL database has a `user_id` foreign key column:

```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    name VARCHAR(100),
    no_of_bags INT,
    price REAL
);
```

When a user makes an API request (e.g. `GET /api/home-bills`):
1. `fetchWithAuth()` attaches `Authorization: Bearer <JWT_TOKEN>`.
2. Flask `@require_auth` verifies the JWT token and extracts `g.user_id = 15`.
3. Every SQL query in the backend includes `WHERE user_id = g.user_id`:

```sql
SELECT * FROM inventory WHERE user_id = 15 AND date = '2026-08-10';
```

- **Result**: User 15 can **only see records owned by user 15**. They can never read, modify, or delete records belonging to User 16 or any other user.

---

## 🗄️ 7. Single Source of Truth (Database vs localStorage)

- **`localStorage`**: Stores **ONLY** the session `token` and basic profile header state (`user`).
- **Neon PostgreSQL Database**: Stores **ALL** business data (bills, kisans, advances, sales, cash collection, expenditures).
- No business data is ever cached or stored in `localStorage`, guaranteeing that your database is the **single source of truth**.

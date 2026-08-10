# Project Problems Explained Clearly

This document explains the current problems in the Agri Commission Manager in plain language.

**Important:** this is only an explanation document. No application code, database, or settings were changed while preparing it.

## The short version

The application has a good starting structure: a React frontend, a Flask backend, and SQLite/PostgreSQL database support.

However, it is **not safe to use with real users or real financial data yet**. The biggest reasons are:

1. A person can pretend to be another user.
2. Google sign-in is not actually verified by the server.
3. The default admin password is publicly known.
4. Some pages show “saved” even though they do not save anything.
5. Some reports show incorrect financial data.
6. A few pages currently crash when they try to contact the backend.

The recommended order is: **secure access first, protect existing data second, repair broken pages/reports third, then clean up deployment and tests.**

---

## How the application works today

```text
Browser (React frontend)
        ↓
Axios sends requests to Flask API
        ↓
Flask reads/writes database records
        ↓
PostgreSQL when DATABASE_URL exists
or SQLite file (backend/lemons.db) when it does not
```

When a user signs in, the frontend saves a user object and a token in the browser's local storage. For each request, it sends the user ID in a request header.

That sounds reasonable, but the backend currently trusts any user ID that arrives from the browser. This is the most serious problem.

---

## Problems that must be fixed before real use

### 1. Users can pretend to be other users

**What happens now**

The browser tells the backend which user it is by sending a value such as `X-User-Id: 1`.

The backend accepts that value without proving that the user is really user 1.

**Why this is dangerous**

Someone with basic browser/API knowledge could change the number to another user's ID. They could then potentially view, add, edit, or delete that user's bills, advances, cash collections, and other data.

**Plain-English example**

It is like a bank allowing a customer to write any account number on a piece of paper and trusting it without checking their identity.

**Safest fix**

Use a real server-verified login token. The backend must read the user identity from that verified token, not from a browser-supplied user ID header, query parameter, or JSON field.

---

### 2. Google login can be bypassed

**What happens now**

The backend Google-login endpoint accepts an email address and name. It does not verify a real Google-issued identity token.

**Why this is dangerous**

A person could submit another person's email address directly to the API and be treated as that person. There is also fallback frontend behavior that can create a local “logged in” state when Google authentication fails.

**Safest fix**

Use Google Identity Services properly:

- The frontend sends a Google ID token to the backend.
- The backend verifies its signature, expiry, issuer, and client ID.
- If verification fails, login must fail completely.
- Remove every fake/fallback Google-login path.

---

### 3. The default admin account is unsafe

**What happens now**

The database automatically creates an admin user with:

```text
username: admin
password: admin
```

The backend also contains a fallback that still accepts this password even if the stored password was changed.

**Why this is dangerous**

Anyone who knows common default credentials can sign in as the administrator.

**Safest fix**

- Remove the automatic production admin account.
- Create the first administrator manually during deployment.
- Change password storage from MD5 to a modern password hash.
- Force password reset for existing accounts during the migration.

---

### 4. One user can see another user's data

**What happens now**

The database has a `user_id` field in several tables, but it is optional. Some queries intentionally include records where `user_id` is empty (`NULL`). Some report routes do not filter by user at all.

**Why this is dangerous**

Data such as bills, customer names, phone numbers, financial balances, SMS history, and expenses may be shared between accounts.

**Safest fix**

Before changing anything:

1. Back up the database.
2. Decide who owns older records with no user ID.
3. Assign those records to the correct owner.
4. Make `user_id` mandatory.
5. Add database relationships and require every API route to filter by the authenticated user.

---

## Problems that currently break normal use

### 5. Bills, Advance, and Sold Data pages can crash

**What happens now**

These pages try to use `axios` and the API URL, but their imports are missing.

**What the user sees**

Opening the page may work, but loading, saving, updating, or deleting data can produce a browser error instead of completing the action.

**Safest fix**

Restore the missing imports in these three pages, then test each action manually.

---

### 6. Some menu pages are only demonstrations, not real features

The following pages look functional but do not save or fetch real database data:

- Local Sale
- Shops
- Bags
- Kisans

**What happens now**

For example, a page may show “Saved successfully!” but only clears the form. Other buttons display fixed sample rows such as “Shop Laxmi Stores” or “Local Retailer.”

**Why this matters**

Users may believe they saved important data when nothing was stored.

**Safest fix**

After authentication and user separation are fixed, connect these pages to their existing backend endpoints. Remove all fixed demonstration records and show a real “No data found” message when appropriate.

---

### 7. Date-range reports do not actually use the selected range

**Affected pages**

- Expenditures
- Cash Collection

**What happens now**

The frontend sends a start date and end date. The backend ignores both and reads only a single `date` value, usually defaulting to today.

**What the user sees**

Choosing “from 1 August to 10 August” may show only today's records, making the report unreliable.

**Safest fix**

Add proper `fromDate` and `toDate` handling in the backend, validate that the start date is not after the end date, and test both single-day and multi-day reports.

---

### 8. The balance sheet currently uses the wrong data

**What happens now**

The Balance Sheet page first looks for old browser-only data. If it does not find any, it asks the backend for one specific date: 1 January of the selected year.

The backend then totals normal BUY records, not the buyer records the page claims to report.

**Why this matters**

The displayed buyer balance can be incomplete, incorrect, or unrelated to the selected year.

**Safest fix**

Create one clear backend report for buyer balances:

- Filter by the signed-in user.
- Filter by the full selected year/date range.
- Return buyer bills, payments, advances, totals, and pending amount.
- Make the frontend display only that server result.

---

### 9. Buyer bill information is lost or saved incorrectly

**What happens now**

- The buyer form captures Kisan names per channel, but the backend does not save them.
- Payment mode is stored in a field called `village`, which is unrelated.
- Editing a buyer bill creates a new bill instead of updating the old one.
- Some submitted fields, including sale values, are ignored.

**Why this matters**

Buyer balances can be wrong, duplicate records can be created, and important details can disappear after saving.

**Safest fix**

Create a proper buyer-bill design: one bill header plus one or more line items. Save payment status and payment method in correctly named fields. Add a dedicated buyer-bill update API.

---

### 10. The Advance page can edit or delete ordinary bills

**What happens now**

The Advance page lists both dedicated advances and ordinary bills that happen to have an advance amount. Its update/delete actions do not check that the record is really an advance.

**Why this matters**

Editing or deleting an “advance” could accidentally change or remove a normal Kisan bill.

**Safest fix**

Either use a separate advances table, or make every advance action strictly require `type = ADVANCE`.

---

### 11. “Send SMS” does not send a real SMS

**What happens now**

The backend records a message as `SENT` in the database, but it does not call an SMS provider. The browser may open WhatsApp or the phone's messaging app instead.

**Why this matters**

The system can claim an SMS was sent when it was only logged or copied.

**Safest fix**

Until an SMS provider is added, rename the feature to something honest such as “Open message” or “Copy message.” For real delivery, integrate an SMS provider and save the provider's delivery result.

---

## Problems that can silently cause wrong data

### 12. The app says “saved successfully” even when saving failed

Several pages catch API errors and ignore them. They then clear the form and show success anyway.

**Why this matters**

A network outage or backend error can make financial data disappear without the user realizing it.

**Safest fix**

Only show success after the backend returns success. On failure, keep the form values, show a clear error, and let the user retry.

---

### 13. Logging out does not fully log out

The app removes the saved user details but leaves the token in the browser.

**Why this matters**

The next person using the same browser may still send requests with the previous user's token.

**Safest fix**

Clear both the user data and token on logout. Once real server sessions exist, revoke the session as well.

---

### 14. Old browser storage is mixed with new server data

Some pages still read old local-storage keys such as `agri_local_bills`. Current pages mostly save through the backend instead.

**Why this matters**

Old browser-only records can reappear, duplicate server records, or make reports differ from one device to another.

**Safest fix**

Choose one source of truth: the database. After taking a backup and deciding whether old browser data matters, remove the old local-storage paths.

---

### 15. Kisan phone numbers are not connected to bills

There is a Kisan directory concept, but bills do not reliably store or reference the Kisan phone number.

**What the user sees**

SMS screens often show `-` instead of a mobile number and require manual entry.

**Safest fix**

Link a bill to a Kisan record, or copy the phone number into the bill when it is created.

---

## Database and testing concerns

### 16. Financial values use floating-point numbers

Amounts such as price, advance, expenses, and hamali use `REAL`/`float` values.

**Why this matters**

Computers can represent some decimal values inaccurately. Over many financial calculations, small rounding differences can appear.

**Safest fix**

Store money as whole paise (integers) or fixed decimal values. Do this through a careful migration after a database backup.

---

### 17. Database changes run automatically at startup

The application creates tables, adds columns, and creates the admin account whenever it starts. Some errors are silently ignored.

**Why this matters**

Production deployments can change the database unexpectedly, and failures can be hidden.

**Safest fix**

Use proper versioned database migrations. A migration should either complete successfully or clearly fail with an error.

---

### 18. Running the existing backend tests changes the local database

The test file says it uses a test database, but it actually initializes the normal local SQLite file at `backend/lemons.db`.

**Why this matters**

Running tests can add test bills, advances, users, and other records to local real data.

**Safest fix**

Configure tests to use a temporary database created only for the test run, then delete it after the tests finish.

---

## Deployment and settings problems

### 19. The frontend may point to the wrong backend

There are three different backend names in the project:

- `lemon-commission-backend`
- `agri-commission-backend`
- `agri-commission-manager`

The deployment guide, Render files, and frontend fallback do not agree.

**What the user sees**

The deployed website may fail to load data even though the backend itself is running.

**Safest fix**

Choose one official backend URL. Store it as `VITE_API_BASE_URL` in Vercel. Remove the hard-coded fallback URL or make it a safe local-development value.

---

### 20. Frontend environment settings are incorrect

The frontend local environment file currently contains `DATABASE_URL`.

**Why this matters**

The frontend does not use that variable. Database credentials should never be managed by the browser application.

**Safest fix**

- Keep `DATABASE_URL` only on the backend/Render side.
- Put `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in the frontend/Vercel environment.
- Never put database passwords in frontend variables.

---

### 21. Deployment files are duplicated and disagree

There are root and backend versions of Docker, Render, requirements, and Vercel-related configuration. Their commands and service names differ.

**Why this matters**

Two developers can deploy the same repository in different ways and get different results.

**Safest fix**

Keep one documented deployment method for this monorepo:

- one Render configuration,
- one backend Dockerfile approach,
- one Vercel configuration,
- one requirements file per Python application.

---

## Recommended repair plan

### Phase 1 — Security first

Do these before allowing multiple people to use the app:

1. Replace fake/predictable tokens with verified authentication.
2. Fix Google token verification.
3. Remove default admin/admin access.
4. Enforce server-side user ownership on every API route.
5. Back up and safely assign legacy records with empty user IDs.

### Phase 2 — Stop incorrect or missing data

1. Repair Bills, Advance, and Sold Data page imports.
2. Make save errors visible instead of claiming success.
3. Repair buyer-bill saving/editing.
4. Fix advance deletion rules.
5. Fix date-range queries and balance reports.
6. Replace mock-only pages with real API-connected pages.

### Phase 3 — Make the system reliable

1. Use proper database migrations.
2. Use safe money/date types and indexes.
3. Move tests to a temporary test database.
4. Remove obsolete local storage code.
5. Consolidate deployment configuration and environment variables.

---

## What I recommend doing next

Do **not** start by fixing small UI styling or adding features. The safest next task is a focused security and data-ownership repair plan.

Once you approve, the changes should be made in small, testable stages with a database backup before any schema or existing-data migration.

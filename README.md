# PayPulse - Digital Wallet and Transaction Management System

A full-stack, enterprise-grade, academic BTech CSE project implementing a modern digital wallet with atomic money transfers, simulated payment gateway top-ups, JWT security, and administrative telemetry.

---

## 📌 Project Overview
**PayPulse** enables users to safely store digital money, top up funds via simulated payment methods (UPI, Debit/Credit Card, Net Banking), instantly transfer funds to other registered users by email or phone, track complete transaction histories with downloadable receipts, and receive real-time notifications. An administrative portal enables comprehensive system monitoring, balance liquidity tracking, and user account freeze/unfreeze controls.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Angular 21, TypeScript, HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Angular Reactive Forms, Angular Router |
| **Backend** | Java 17 LTS, Spring Boot 3.2, Spring Security 6, JWT (`jjwt 0.12.5`), Spring Data JPA, Hibernate, Maven |
| **Database** | MySQL 8.0 (InnoDB Engine, UTF-8, Check Constraints, Foreign Keys) |
| **Testing** | JUnit 5, Mockito, Spring Security Test, Postman Collection |

---

## 🏗️ Architecture & Security
- **Atomic Money Transfers**: Transfer operations are enclosed in Spring `@Transactional(rollbackFor = Exception.class)` boundaries. If any step fails, balance modifications on both wallets are reverted.
- **Negative Balance Prevention**: Enforced at the business layer (`BigDecimal.compareTo`) and database layer (`CHECK (balance >= 0.00)`).
- **Stateless Authentication**: BCrypt password hashing (strength 10) with HMAC-SHA256 JWT tokens.
- **Privacy Protection**: User search API masks sensitive phone numbers and emails (`+9198*****210`, `u****@wallet.com`).

---

## 🗄️ Database Design (MySQL)

### Tables
1. `users`: Stores user identity, BCrypt hashed passwords, role (`USER`, `ADMIN`), and status (`ACTIVE`, `BLOCKED`).
2. `wallets`: Stores wallet balance (1:1 with users) with positive check constraints.
3. `transactions`: Stores historical ledger of top-ups and peer transfers with unique reference numbers (`TXN...`).
4. `wallet_topups`: Logs simulated gateway payment transactions (UPI, Card, Net Banking).
5. `notifications`: Real-time user alert records.

The complete SQL setup script is provided at [`database/schema.sql`](./database/schema.sql).

---

## 🚀 How to Run the Project

### Prerequisites
- **Java 17 JDK** installed.
- **Node.js** (v20+ or v24+) & **npm** installed.
- **MySQL 8.0 Server** running on `localhost:3306`.

---

### Step 1: Database Setup
1. Open **MySQL Workbench** or your MySQL command line client.
2. Execute the script [`database/schema.sql`](./database/schema.sql):
   ```sql
   mysql -u root -p < database/schema.sql
   ```
   *(Default password in `application.properties` is configured for root: `123456`. You can also configure environment variables `DB_USERNAME` and `DB_PASSWORD`)*.

---

### Step 2: Run the Spring Boot Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run using Maven or the included runner:
   ```bash
   mvn spring-boot:run
   ```
   *(Or on Windows: `mvnw.bat spring-boot:run`)*.
3. Backend starts at: `http://localhost:8080`
   *(DataInitializer will automatically ensure seed users exist if table is fresh!)*

---

### Step 3: Run the Angular Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the Angular development server:
   ```bash
   npm start
   ```
   *(Or `ng serve`)*.
3. Open your browser and navigate to: `http://localhost:4200`

---

## 🔑 Test Credentials (For Demo & Viva)

All accounts share the default password: **`password123`**

| Role | Name | Email | Initial Balance | Description |
| :--- | :--- | :--- | :--- | :--- |
| **USER** | Rahul Sharma | `user1@wallet.com` | ₹7,500.00 | Primary test user |
| **USER** | Priya Patel | `user2@wallet.com` | ₹4,200.00 | Recipient test user |
| **USER** | Amit Verma | `amit@wallet.com` | ₹1,500.00 | Secondary user |
| **ADMIN** | Administrator | `admin@wallet.com` | ₹0.00 | Accesses Admin Console |

> **Viva Tip**: On the Login screen, click any of the **"Quick Demo Login"** buttons to auto-fill credentials with one click!

---

## 📋 Complete Demonstration Flow
1. **Login as User 1 (Rahul)**: View current wallet balance (₹7,500.00).
2. **Add Money**: Click **Add Money**, enter `₹1,500`, select `UPI`, and watch the simulated gateway animation. Balance updates to ₹9,000.00.
3. **Send Money**:
   - Go to **Send Money**.
   - Type `user2@wallet.com` (or search for Priya Patel).
   - Enter `₹1,000` and note `Project expense`.
   - Review confirmation breakdown (Current: ₹9,000, Remaining: ₹8,000).
   - Click **Confirm Transfer** -> Instant success receipt generated (`TXN...`).
4. **Inspect Transaction History**: See updated ledger with color-coded badges.
5. **Switch to User 2 (Priya)**: Log in as `user2@wallet.com` to observe that Priya received the `+₹1,000` and has a new incoming notification!
6. **Log in as Admin**: Go to `admin@wallet.com` -> Admin Dashboard updates with new totals, user growth, and audit log.

---

## 📮 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account & auto-provision wallet
- `POST /api/auth/login` - Authenticate & receive JWT token

### Wallet (`/api/wallet`)
- `GET /api/wallet/balance` - Get authenticated user's wallet balance
- `POST /api/wallet/add-money` - Top up wallet (simulated)
- `GET /api/wallet/topups` - View top-up records

### Transactions (`/api/transactions`)
- `POST /api/transactions/send` - Send money to another user
- `GET /api/transactions/history` - User's transactions with filtering & pagination
- `GET /api/transactions/recent` - Top recent transactions
- `GET /api/transactions/summary` - Total sent & received sums
- `GET /api/transactions/{id}` - Transaction details receipt

### User Profile & Search (`/api/users`)
- `GET /api/users/profile` - User profile details
- `PUT /api/users/change-password` - Change account password
- `GET /api/users/search?q={query}` - Search active users (masked details)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Paginated notifications
- `GET /api/notifications/unread-count` - Unread alerts counter
- `PUT /api/notifications/{id}/read` - Mark single notification read
- `PUT /api/notifications/read-all` - Mark all read

### Admin Panel (`/api/admin`) - Protected by `ROLE_ADMIN`
- `GET /api/admin/dashboard` - Platform metrics & totals
- `GET /api/admin/users` - User management list & status
- `PUT /api/admin/users/{id}/block` - Freeze user account
- `PUT /api/admin/users/{id}/unblock` - Unfreeze user account
- `GET /api/admin/transactions` - Complete system audit log

---

## 🧪 Postman Collection
Import [`postman_collection.json`](./postman_collection.json) directly into Postman to run pre-configured test suites with automated token capture.

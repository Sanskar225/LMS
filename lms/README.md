# 🏦 LoanPro — Loan Management System

A complete full-stack MERN application built with **Next.js 14**, **Express**, **TypeScript**, and **MongoDB**.

---

## 📋 Features

### Borrower Portal
- JWT Authentication (register / login with hashed passwords)
- **4-Step Application Flow** with progress stepper
- **Server-side Business Rule Engine (BRE):**
  - Age must be 23–50 years
  - Monthly salary ≥ ₹25,000
  - Valid PAN format: `ABCDE1234F`
  - Must be Salaried or Self-Employed
- Salary slip upload (PDF/JPG/PNG, max 5 MB)
- Live loan calculator with sliders: `SI = (P × R × T) / (365 × 100)`
- Loan status tracker

### Operations Dashboard (4 Modules)
| Module | Role | Actions |
|---|---|---|
| Sales | Sales, Admin | View all borrower leads & application stages |
| Sanction | Sanction, Admin | Approve or reject applied loans (with reason) |
| Disbursement | Disbursement, Admin | Release funds for sanctioned loans |
| Collection | Collection, Admin | Record payments (unique UTR), auto-close on full repayment |

### Security
- Role-Based Access Control (RBAC) enforced on **frontend AND backend**
- HTTP 403 for unauthorized access attempts
- JWT with expiry, bcrypt password hashing

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File Upload | Multer |

---

## 📁 Project Structure

```
lms/
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB connection
│   │   ├── controllers/      # auth, borrower, loan
│   │   ├── middleware/        # JWT authenticate + authorize RBAC
│   │   ├── models/            # User, BorrowerProfile, Loan (with Payments)
│   │   ├── routes/            # auth, borrower, loan routes
│   │   └── utils/             # BRE engine, loan calculator, seed script
│   ├── uploads/               # Salary slip files (gitignored)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (borrower)/            # Borrower multi-step flow (route group)
│       │   │   ├── layout.tsx          # Stepper header layout
│       │   │   └── borrower/
│       │   │       ├── personal-details/page.tsx
│       │   │       ├── upload/page.tsx
│       │   │       ├── loan-config/page.tsx
│       │   │       └── status/page.tsx
│       │   ├── (dashboard)/           # Dashboard route group
│       │   │   ├── layout.tsx          # Sidebar layout
│       │   │   └── dashboard/
│       │   │       ├── page.tsx        # Overview
│       │   │       ├── sales/page.tsx
│       │   │       ├── sanction/page.tsx
│       │   │       ├── disbursement/page.tsx
│       │   │       └── collection/page.tsx
│       │   ├── auth/page.tsx           # Login + Register
│       │   ├── layout.tsx
│       │   ├── page.tsx                # Smart redirect
│       │   └── globals.css
│       ├── context/AuthContext.tsx
│       ├── lib/api.ts
│       ├── lib/utils.ts
│       └── types/index.ts
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB** running locally OR a MongoDB Atlas URI
- **npm** (comes with Node.js)

---

### Step 1 — Clone / Extract the project

```bash
# If cloning from GitHub:
git clone <repo-url>
cd lms

# Or extract the ZIP and enter the folder:
cd lms
```

---

### Step 2 — Setup the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

> **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string.

---

### Step 3 — Seed the Database

```bash
# Still inside /backend
npm run seed
```

This creates one account per role:

```
╔══════════════════════════════════════════════════════════════╗
║  Role          │ Email                  │ Password           ║
╠══════════════════════════════════════════════════════════════╣
║  admin         │ admin@lms.com          │ Admin@123          ║
║  sales         │ sales@lms.com          │ Sales@123          ║
║  sanction      │ sanction@lms.com       │ Sanction@123       ║
║  disbursement  │ disburse@lms.com       │ Disburse@123       ║
║  collection    │ collect@lms.com        │ Collect@123        ║
║  borrower      │ borrower@lms.com       │ Borrower@123       ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 4 — Setup the Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

The `.env.local` file is already included:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### Step 5 — Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# ✅ Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# ✅ Starts on http://localhost:3000
```

Open your browser at **http://localhost:3000**

---

## 🔐 Login Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | admin@lms.com | Admin@123 | All dashboard modules |
| Sales | sales@lms.com | Sales@123 | Sales module only |
| Sanction | sanction@lms.com | Sanction@123 | Sanction module only |
| Disbursement | disburse@lms.com | Disburse@123 | Disbursement module only |
| Collection | collect@lms.com | Collect@123 | Collection module only |
| Borrower | borrower@lms.com | Borrower@123 | Borrower portal only |

---

## 🔄 Loan Status Workflow

```
REGISTER → PERSONAL DETAILS (BRE Check) → UPLOAD SALARY SLIP → CONFIGURE LOAN → APPLY
                    ↓
                APPLIED ──→ SANCTIONED ──→ DISBURSED ──→ CLOSED
                    ↘ REJECTED
```

- **BRE fails** → blocked at step 2, cannot proceed
- **Loan auto-closes** when `totalPaid >= totalRepayment`

---

## 📡 Key API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/borrower/profile
POST   /api/borrower/personal-details    ← runs BRE server-side
POST   /api/borrower/upload-salary-slip  ← multipart/form-data

POST   /api/loans/apply
GET    /api/loans/my-loans
GET    /api/loans/sales/leads            [admin, sales]
GET    /api/loans/sanction/applied       [admin, sanction]
PATCH  /api/loans/sanction/:id           [admin, sanction]
GET    /api/loans/disbursement/sanctioned [admin, disbursement]
PATCH  /api/loans/disbursement/:id/disburse [admin, disbursement]
GET    /api/loans/collection/active      [admin, collection]
POST   /api/loans/collection/:id/payment [admin, collection]
GET    /api/loans/all                    [all dashboard roles]
```

---

## 📐 Business Rules (BRE)

All BRE checks run **server-side only** — prevents bypass via DevTools or Postman:

| Rule | Condition |
|---|---|
| Age | Between 23 and 50 years |
| Salary | ≥ ₹25,000 per month |
| PAN | Regex: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` |
| Employment | Salaried or Self-Employed only |

---

## 🗄 Database Collections

- **users** — all accounts (admin, sales, sanction, disbursement, collection, borrower)
- **borrowerprofiles** — personal details, BRE results, salary slip path
- **loans** — full loan lifecycle with embedded payments array

---

## 📦 Production Build

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

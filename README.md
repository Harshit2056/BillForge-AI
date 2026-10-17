# ⚡ BillForge AI

> **Modern, Multi-Tenant AI Billing, POS & Smart Inventory SaaS Platform.**

<p align="left">
  <img src="https://img.shields.io/badge/React_18-Vite_6-61DAFB?logo=react&logoColor=black" alt="React + Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Node.js & Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Vision-8E75C2?logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 💡 About Project

**BillForge AI** is an all-in-one retail billing and management solution built for shops and supermarkets. It simplifies daily store operations by combining a **superfast POS checkout terminal**, **live stock tracking**, **instant PDF invoice generation**, and **Google Gemini AI** for smart business insights.

---

## ✨ Features

- 🛒 **Fast POS Checkout**: Instant product search, dynamic cart, discounts, tax calculations, and cash/UPI/card payment support.
- 🤖 **Gemini AI Hub**:
  - Ask business questions in natural language (*e.g., "What were this week's top selling products?"*).
  - Predictive stock demand forecasting.
  - Smart pricing recommendations.
  - Upload bill/receipt photos to auto-extract items with AI OCR.
- 📦 **Smart Inventory**: Real-time stock auto-deduction on billing, low-stock warnings, and manual adjustments (+/-).
- 🧾 **Instant PDF Invoices**: Auto-generates branded, printable PDF invoices with detailed tax and payment breakdown.
- 🏢 **Multi-Tenant & RBAC**: Complete data isolation per shop. Separate roles for **Owner**, **Manager**, and **Staff / Cashier**.
- 🔐 **Secure Auth**: JWT access/refresh tokens, token blacklisting on logout, and 15-minute email password reset links via Nodemailer.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend**: Node.js, Express 5, MongoDB, Mongoose, JWT, Nodemailer
- **AI & Tools**: Google Gemini API (`@google/genai`), PDFKit (PDF generation), Multer

---

## 🚀 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/Harshit2056/BillForge-AI.git
cd BillForge-AI
```

### 2. Backend Setup
```bash
cd BACKEND
npm install
```
Create a `.env` file inside `BACKEND/`:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
DB_NAME=billforge
CLIENT_URL=http://localhost:3000
ACCESS_TOKEN_SECRET_KEY=your_access_token_secret
ACCESS_TOKEN_EXPIRY_DATE=1d
REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY_DATE=10d
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_id
EMAIL_PASS=your_gmail_app_password
```
Run the backend:
```bash
npm run dev
# Server runs on: http://localhost:4000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd FRONTEND
npm install
npm run dev
# App runs on: http://localhost:3000
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Owner** | Full access to shop settings, staff management, billing, inventory, and analytics. |
| **Manager** | Manage inventory, generate invoices, view analytics, and manage staff operations. |
| **Cashier / Staff** | Fast POS checkout, inventory view, and customer invoicing. |

---

## 📄 License

This project is licensed under the **ISC License**.

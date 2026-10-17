# ⚡ BillForge AI

> **Modern, Multi-Tenant AI Billing, POS & Smart Inventory SaaS Platform.**

<p align="left">
  <a href="https://bill-forge-ai-w1by-3sbzn6jj8-harshit2056s-projects.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_App-4F46E5?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://billforge-ai-qxxp.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Backend_API-Render_Live-46E3B7?style=for-the-badge&logoColor=black" alt="Live API" />
  </a>
</p>

<p align="left">
  <img src="https://img.shields.io/badge/React_18-Vite_6-61DAFB?logo=react&logoColor=black" alt="React + Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Node.js & Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Vision-8E75C2?logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 🔗 Live Application Links

- **Frontend (Web App)**: [https://bill-forge-ai-w1by-3sbzn6jj8-harshit2056s-projects.vercel.app](https://bill-forge-ai-w1by-3sbzn6jj8-harshit2056s-projects.vercel.app/)
- **Backend (API Service)**: [https://billforge-ai-qxxp.onrender.com](https://billforge-ai-qxxp.onrender.com)

---

## 💡 About Project

**BillForge AI** is an all-in-one SaaS platform built for retail stores, supermarkets, and businesses. It streamlines everyday sales with a **superfast POS checkout system**, **real-time automated stock management**, **instant downloadable PDF invoices**, and **Google Gemini AI intelligence** for predictive analytics and receipt scanning.

Each registered business operates with complete multi-tenant isolation, allowing owners to manage multiple staff accounts, track daily revenues, and get AI-driven sales recommendations.

---

## ✨ Key Features

- 🛒 **Point of Sale (POS)**: Real-time product search, dynamic cart, discounts, taxes, customer details, and support for Cash, UPI & Card payments.
- 🤖 **Google Gemini AI Hub**:
  - **Natural Language Assistant**: Ask sales questions in plain English (*e.g., "What was my best selling category this week?"*).
  - **Demand Forecasting**: Predictive analysis to avoid stock-outs before they happen.
  - **Dynamic Pricing**: AI-driven margin & pricing recommendations based on inventory velocity.
  - **Smart Receipt OCR**: Upload supplier bills to auto-extract line items, prices, and quantities.
- 📦 **Smart Inventory**: Instant stock deduction on billing, low-stock threshold alerts, manual stock adjustments (+/-), and server-side pagination.
- 🧾 **Instant PDF Invoicing**: Auto-generates branded, downloadable/printable PDF invoices with detailed tax and payment breakdowns.
- 🏢 **Multi-Tenant & RBAC**: Strict shop data separation. Role-based permissions for **Owner**, **Manager**, and **Staff / Cashier**.
- 🔐 **Secure Authentication**: Dual JWT authentication (Access & Refresh tokens) with 15-minute email password recovery links via Nodemailer.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend**: Node.js, Express 5, MongoDB, Mongoose, JWT, Nodemailer
- **AI & Document Tools**: Google Gemini API (`@google/genai`), PDFKit (PDF Invoices), Multer (Image Uploads)
- **Deployment**: Vercel (Frontend) & Render (Backend)

---

## 🚀 Quick Start Guide (Run Locally)

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
GEMINI_API_KEY=your_google_gemini_api_key
EMAIL_USER=your_gmail_id
EMAIL_PASS=your_gmail_app_password
```
Start backend server:
```bash
npm run dev
# Server running at: http://localhost:4000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd FRONTEND
npm install
npm run dev
# Frontend running at: http://localhost:3000
```

---

## 👥 User Roles & Access

| Role | Permissions |
|---|---|
| **Owner** | Full access — Shop profile, staff management, billing, inventory, analytics, and AI tools. |
| **Manager** | Inventory management, invoice creation, analytics view, and staff operations. |
| **Cashier / Staff** | Fast POS checkout, inventory lookups, and customer invoice generation. |



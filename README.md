# ⚡ BillForge AI — Multi-Tenant AI Billing, POS & Smart Inventory SaaS

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Node.js & Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75C2?logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-ISC-blue.svg" alt="License" />
</p>

---

## 📌 Overview

**BillForge AI** is an enterprise-ready, multi-tenant SaaS application designed for modern retail shops, supermarkets, and businesses. It unites **high-speed Point of Sale (POS)**, **real-time stock inventory**, **automated PDF invoicing**, and **Google Gemini AI intelligence** into a single, cohesive, dark-themed dashboard.

Each registered business operates within an isolated tenant environment, allowing shop owners and managers to govern catalog items, issue GST/tax invoices, track daily revenues, and gain predictive AI insights on sales demand and dynamic pricing.

---

## 🚀 Key Features

### 🛒 1. Point of Sale (POS) Terminal
- **Instant Product Search**: Filter items by name, SKU, or category in real-time.
- **Dynamic Cart Management**: Adjust quantities, apply flat or percentage discounts, and customize tax rates per order.
- **Customer Profiling**: Capture customer names, phone numbers, and addresses directly at checkout.
- **Multi-Payment Modes**: Support for **Cash**, **UPI**, and **Card** payments.
- **Instant Checkout & PDF**: Generates sequential invoice numbers and offers one-click printable PDF downloads.

### 🤖 2. Google Gemini AI Hub
- **Natural Language Sales Queries**: Ask conversational questions (e.g., *"What were my top 3 selling items this week?"*) and receive actionable summaries.
- **Predictive Demand Forecasting**: Machine-learning-assisted inventory forecasting to preempt out-of-stock scenarios.
- **Smart Dynamic Pricing**: AI-powered margin recommendations based on stock velocity, cost price, and sales volume.
- **Receipt OCR Extraction**: Upload supplier receipt photos to automatically extract itemized products, quantities, and prices via multimodal Gemini Vision.

### 📦 3. Real-Time Smart Inventory Management
- **Automated Stock Sync**: Product inventory decrements instantly upon invoice generation.
- **Low-Stock Alerts**: Visual threshold warnings for items running critical on quantity.
- **Stock Adjustment**: Fast increment/decrement controls with manual stock reconciliation reasons.
- **Server-Side Pagination**: Scalable handling of large product catalogs with search and category filtering.

### 🧾 4. Invoicing & PDF Engine
- **Branded Invoices**: Professional PDF generation powered by `pdfkit` featuring shop details, line items, tax breakdowns, and payment status.
- **Comprehensive History**: Filter historical invoices by date ranges, payment status (Paid, Pending, Cancelled), and customer details.

### 👥 5. Multi-Tenant Architecture & Role-Based Access Control (RBAC)
- **Tenant Isolation**: Middleware guarantees queries are partitioned strictly by `shopId`.
- **Role Hierarchy**:
  - **Owner**: Complete authority over shop settings, staff recruitment, billing, inventory, and analytics.
  - **Manager**: Authority to manage stock, issue invoices, view analytics, and manage staff operations.
  - **Cashier / Staff**: Focused access for fast billing, inventory lookups, and customer invoicing.

### 🔐 6. Authentication & Security
- **Dual JWT Tokens**: Short-lived Access Tokens (Authorization Bearer) paired with HttpOnly Refresh Tokens.
- **Password Recovery**: Secure, tokenized password reset flow delivering 15-minute expiration links via Nodemailer.
- **Security Hardened**: Protected with Helmet headers, CORS policies, bcrypt password hashing, and token blacklisting on logout.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express v5, MongoDB, Mongoose, Mongoose-Paginate-v2 |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Document Engine** | PDFKit (server-side invoice rendering) |
| **Media & Mail** | Multer (file uploads), Nodemailer (transactional emails) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt.js, Cookie-Parser |
| **Deployment** | Backend: Render \| Frontend: Vercel |

---

## 📂 Repository Structure

```text
BillForge/
├── BACKEND/
│   ├── src/
│   │   ├── config/
│   │   │   ├── ai.js                 # Google Gemini client configuration
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── ai.controller.js      # Natural language, forecasting, OCR controllers
│   │   │   ├── auth.controller.js    # Register, login, refresh, password reset
│   │   │   ├── invoice.controller.js # Invoice creation, PDF stream, analytics
│   │   │   ├── product.controller.js # CRUD, pagination, stock adjustments
│   │   │   └── shop.controller.js    # Shop profile, staff additions/removals
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification & token blacklisting
│   │   │   ├── multer.middleware.js  # Temporary disk storage for file uploads
│   │   │   └── tenant.middleware.js  # Tenant shop extraction and assignment
│   │   ├── models/
│   │   │   ├── blackListedToken.model.js
│   │   │   ├── invoice.model.js
│   │   │   ├── product.model.js
│   │   │   ├── shop.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── ai.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── invoice.routes.js
│   │   │   ├── product.routes.js
│   │   │   └── shop.routes.js
│   │   ├── services/
│   │   │   ├── invoice.service.js    # PDFKit PDF generation utility
│   │   │   └── mail.service.js       # Nodemailer SMTP transport service
│   │   ├── utils/
│   │   │   ├── apiError.js
│   │   │   ├── apiResponse.js
│   │   │   └── asyncHandler.js
│   │   ├── app.js                    # Express app initialization & middleware
│   │   └── server.js                 # Entry point & server listener
│   └── package.json
│
├── FRONTEND/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.jsx     # Master responsive wrapper
│   │   │       ├── Navbar.jsx        # Header bar with user profile
│   │   │       ├── ProtectedRoute.jsx# Auth guard router
│   │   │       └── Sidebar.jsx       # Navigation drawer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global authentication state
│   │   │   └── ToastContext.jsx      # Global toast alerts & notifications
│   │   ├── hooks/
│   │   │   └── useHooks.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── AIHub.jsx             # Gemini AI assistant & OCR interface
│   │   │   ├── Analytics.jsx         # Revenue & sales charts
│   │   │   ├── Dashboard.jsx         # Executive overview & KPIs
│   │   │   ├── Inventory.jsx         # Catalog & stock management
│   │   │   ├── Invoices.jsx          # Invoice registry & PDF downloads
│   │   │   ├── POS.jsx               # Cashier point-of-sale checkout
│   │   │   └── Settings.jsx          # Shop metadata & staff governance
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # Route declarations
│   │   ├── services/
│   │   │   ├── ai.service.js
│   │   │   ├── api.js                # Axios instance with interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── invoice.service.js
│   │   │   ├── product.service.js
│   │   │   └── shop.service.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register new shop owner & business | No |
| `POST` | `/login` | Authenticate user and issue tokens | No |
| `POST` | `/logout` | Blacklist current token & sign out | Yes |
| `GET` | `/getUser` | Fetch active user credentials | Yes |
| `POST` | `/refresh-token` | Renew expired access token | No (Uses Refresh Token) |
| `POST` | `/forgot-password` | Request password reset email | No |
| `POST` | `/reset-password/:token`| Set new password with secure token | No |

### 🏢 Shop & Staff Management (`/api/v1/shops`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile` | Get current shop details | Yes |
| `PUT` | `/profile` | Update shop profile & metadata | Yes (Owner) |
| `POST` | `/staff` | Add new staff member | Yes (Owner/Manager) |
| `GET` | `/staff` | List all staff in tenant | Yes |
| `DELETE` | `/staff/:staffId` | Revoke staff access | Yes (Owner/Manager) |

### 📦 Products & Inventory (`/api/v1/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Paginated product list with search/filter | Yes |
| `POST` | `/` | Create a new catalog product | Yes (Owner/Manager) |
| `GET` | `/:id` | Fetch product details by ID | Yes |
| `PUT` | `/:id` | Update product information | Yes (Owner/Manager) |
| `PATCH` | `/:id/stock` | Adjust stock quantity (+/-) | Yes |
| `DELETE` | `/:id` | Remove a product | Yes (Owner/Manager) |

### 🧾 Invoices & Analytics (`/api/v1/invoice`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Create invoice & deduct stock | Yes |
| `GET` | `/` | List invoices with pagination | Yes |
| `GET` | `/:id` | Retrieve single invoice details | Yes |
| `GET` | `/:id/pdf` | Stream generated PDF invoice | Yes |
| `GET` | `/reports/analytics` | Fetch sales & revenue analytics | Yes |

### 🤖 Gemini AI Engine (`/api/v1/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/query` | Natural language sales analysis | Yes |
| `POST` | `/forecast` | Demand forecast predictions | Yes |
| `POST` | `/recommendations` | Smart dynamic pricing recommendations | Yes |
| `POST` | `/scan-receipt` | OCR scan receipt image using Gemini Vision | Yes |

---

## ⚙️ Environment Variables

### 🖥️ Backend (`BACKEND/.env`)
Create a `.env` file in the `BACKEND` directory:

```env
# Server
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
DB_NAME=billforge

# JWT Secrets
ACCESS_TOKEN_SECRET_KEY=your_super_secret_access_key_here_32chars
ACCESS_TOKEN_EXPIRY_DATE=1d
REFRESH_TOKEN_SECRET_KEY=your_super_secret_refresh_key_here_32chars
REFRESH_TOKEN_EXPIRY_DATE=10d

# Google Gemini AI
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Email (Nodemailer for password resets)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v18.x or v20.x or higher)
- **MongoDB** instance (Local or MongoDB Atlas)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/Harshit2056/BillForge-AI.git
cd BillForge-AI
```

### 2. Backend Setup
```bash
cd BACKEND
npm install

# Create and populate your .env file
cp .env.example .env

# Run server in development mode
npm run dev
```
*Backend runs on: `http://localhost:4000`*

### 3. Frontend Setup
Open a second terminal window:
```bash
cd FRONTEND
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## ☁️ Deployment

### 1. Backend (Render / Railway / AWS)
1. Link your GitHub repository to **Render**.
2. Set Environment: **Node.js**.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure all variables from `BACKEND/.env` in the Render Dashboard Environment settings.

### 2. Frontend (Vercel / Netlify)
1. Import repository into **Vercel**.
2. Root Directory: `FRONTEND`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. If using an environment variable for backend URL, ensure `api.js` points to your live Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://billforge-ai-qxxp.onrender.com/api/v1';
   ```

---

## 👥 Role & Permissions Matrix

| Capability | Owner | Manager | Cashier / Staff |
|---|:---:|:---:|:---:|
| Create & Issue POS Invoices | ✅ | ✅ | ✅ |
| Download Invoice PDFs | ✅ | ✅ | ✅ |
| View Inventory & Stock Status | ✅ | ✅ | ✅ |
| Adjust Stock Quantities | ✅ | ✅ | ✅ |
| Add / Edit / Delete Products | ✅ | ✅ | ❌ |
| View Dashboard & Sales Trends | ✅ | ✅ | ❌ |
| Run AI Queries & Forecasting | ✅ | ✅ | ❌ |
| Add & Remove Staff Members | ✅ | ✅ | ❌ |
| Modify Shop Profile / Tax ID | ✅ | ❌ | ❌ |

---

## 📄 License
This project is licensed under the **ISC License**.

---

<p align="center">
  Crafted with ❤️ for modern retailers and businesses by <strong>Harshit Jain</strong>
</p>

# Banking App - Modern Digital Banking Solution

A full-stack banking application built with the MERN stack (MongoDB, Express.js, React, Node.js) that provides modern digital banking features.

## 🚀 Features

- **User Authentication** - Secure registration and login with JWT
- **Account Management** - Create and manage multiple account types
- **Money Transfers** - Internal, domestic, and international transfers
- **Transaction History** - View and filter transaction history
- **Dashboard** - Financial overview with account summaries
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, React Router  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Athulbt/BankingApp.git
cd BankingApp
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Then open `backend/.env` and fill in:

- `MONGODB_URI` – your MongoDB connection string (local or Atlas)
- `JWT_SECRET` – a long random string. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Never commit `.env`. It is already listed in `.gitignore`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

# Running the Application

## Method 1: Run in Separate Terminals

### Terminal 1 - Backend:
```bash
cd backend
npm run dev

```
### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev

```
## 🌐 Access the Application

Once both servers are running:

- **Frontend Application:** `http://localhost:3000`
- **Backend API Server:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`

# Happy Banking! 🏦

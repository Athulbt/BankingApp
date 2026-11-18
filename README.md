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

## 🤖 AI-Assisted Development

I built the first version of this app myself. I then used [Claude Code](https://claude.com/claude-code), Anthropic's AI coding assistant, to review the code for security problems, fix the bugs it found and redesign the UI. I reviewed the findings, decided what to fix and tested the results. That's why Claude appears in this repo's contributors.

### Security issues found and fixed

| Issue | Risk | Fix |
|---|---|---|
| `.env` with database credentials was committed to the public repo | Anyone could access the database | Removed from git, added `.gitignore` and `.env.example`, and I changed the database password |
| Users could create "deposits" through the API | Money could be created out of nothing | Users can no longer create deposits |
| An amount sent as text (`"100"`) was joined to the balance instead of added | A balance of 1,000 could become 1,000,100 | Amounts are validated and converted to numbers |
| The balance check and the deduction were separate steps | Two requests at the same time could spend the same money twice | The deduction is now a single atomic step inside a MongoDB transaction |
| `?accountId=` accepted any account ID | Users could read other people's transactions | Only the user's own accounts are allowed |
| Transfers without a destination still earned reward points | Unlimited free points | A destination is required, and moving money between your own accounts earns no points |
| No limit on login attempts | Password guessing | 10 attempts per 15 minutes |

### Other bugs fixed

- Valid email addresses with longer endings, such as `.info`, were rejected at sign-up
- The fees shown on the Transfer page didn't match what the server charged
- Moving money between your own accounts was counted as income
- Pages showed made-up data when the server couldn't be reached
- The profile and dashboard API routes were written but never connected

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

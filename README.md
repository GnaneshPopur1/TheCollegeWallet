# The College Wallet 🎓💳

> The ultimate financial operating system built specifically for college students.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://the-college-wallet.vercel.app)
[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

**The College Wallet** is an all-in-one personal finance platform designed to eliminate the unique financial stressors of student life. From parsing complex tuition bills and rationing dining dollars, to seamlessly splitting groceries with roommates using AI.

## ✨ Core Features

### 🏦 Complete Financial Dashboard
- **Real-Time Bank Sync**: Integrated with **Plaid** to securely connect checking accounts, savings, and credit cards.
- **Automated Categorization**: Automatically pulls the last 30 days of transactions to calculate cash flow and detect recurring subscriptions.
- **Round-Ups**: Automatically save spare change into a digital vault for a rainy day.

### 🏠 Roommate OS
- **Live Ledger**: See exactly who owes what in your apartment with a clean, instant UI.
- **Group Chat**: Real-time polling chat system right in your roommate dashboard.
- **Push Notifications**: Receive instant Web Push Notifications whenever a roommate adds a shared expense.

### 📸 Gemini AI Receipt Scanner
- Powered by **Google Gemini 1.5 Flash Vision**.
- Upload a photo of your grocery receipt and the AI automatically extracts the store, date, itemized purchases, tax, and total.
- One-click "Split Evenly" automatically logs the expense to your roommate ledger.

### 🎓 The Education Hub
- **Dining Dollars Calculator**: Tracks your campus dining balance and calculates exactly how much you can safely spend per day without starving before finals.
- **Tuition Breakdown**: Tracks total tuition vs. applied financial aid to give a clear picture of remaining out-of-pocket costs and estimated student debt.

## 🚀 Tech Stack
- **Frontend**: Angular 17 (Standalone Components), SCSS, RxJS, Chart.js
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL (hosted on Supabase)
- **AI Services**: Google Generative AI (`gemini-1.5-flash`)
- **Bank APIs**: Plaid Link
- **Deployment**: Vercel Serverless

## 🛠️ Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Plaid Developer Keys
- Google Gemini API Key

### Setup
1. Clone the repository:
```bash
git clone https://github.com/GnaneshPopur1/TheCollegeWallet.git
cd TheCollegeWallet
```

2. Install dependencies:
```bash
# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

3. Configure Environment Variables
Create a `.env` file in the `backend` directory based on the `.env.example` file. 

4. Run the full stack locally:
```bash
# In terminal 1
cd backend
npm run dev

# In terminal 2
cd frontend
npm start
```

## 📜 License
This project is proprietary and confidential. Created for the Penn State Berks Pilot Program.

# The College Wallet 🎓

A complete financial operating system tailored specifically for college students. The College Wallet simplifies tracking tuition, safe daily dining spend, roommate settlements, and personal banking, all inside one clean, secure dashboard.

## Overview
The College Wallet breaks down traditional student finances into digestible epics:
1.  **Personal Banking:** Integration with Plaid API to view external checking/savings accounts.
2.  **Bursar & Tuition:** Tracking financial aid, tuition payments, and academic terms.
3.  **Meal Plans:** A "Safe Daily Spend" calculator that prevents students from running out of Dining Dollars before the semester ends.

## Tech Stack
-   **Frontend:** Angular 21 (Reactive Forms, Signals, SCSS)
-   **Backend:** Node.js, Express
-   **Database:** Prisma ORM, PostgreSQL (via Docker/Cloud)
-   **Security:** AES-256-GCM encryption for bank tokens, JWT authentication, Helmet.

## Running Locally

To spin up the local development environment:

```bash
npm run install:all
npm start
```

Access the frontend at `http://localhost:4200` and the backend at `http://localhost:3000`.

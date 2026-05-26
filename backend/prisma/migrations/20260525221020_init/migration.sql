-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "mfa_secret" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bank_Connection" (
    "connection_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "institution_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Bank_Connection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "account_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "current_balance" REAL NOT NULL,
    "interest_rate" REAL,
    CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "Bank_Connection" ("connection_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "merchant_name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("account_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Academic_Term" (
    "term_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "semester_name" TEXT NOT NULL,
    "tuition_total" REAL NOT NULL,
    "aid_applied" REAL NOT NULL,
    "dining_dollars_bal" REAL NOT NULL,
    CONSTRAINT "Academic_Term_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Credit_Score" (
    "record_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "credit_score" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Credit_Score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

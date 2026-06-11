const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash("password123", salt);

  const user = await prisma.user.create({
    data: {
      email: "test@college.edu",
      password_hash
    }
  });

  const connection = await prisma.bank_Connection.create({
    data: {
      user_id: user.user_id,
      institution_name: "Chase Bank",
      access_token: "mock_token",
      status: "active"
    }
  });

  const account = await prisma.account.create({
    data: {
      user_id: user.user_id,
      connection_id: connection.connection_id,
      account_type: "checking",
      current_balance: 14520.50
    }
  });

  await prisma.transaction.createMany({
    data: [
      {
        account_id: account.account_id,
        amount: -120.00,
        merchant_name: "Campus Bookstore",
        date: new Date(),
        is_recurring: false
      },
      {
        account_id: account.account_id,
        amount: -10.99,
        merchant_name: "Spotify",
        date: new Date(Date.now() - 86400000),
        is_recurring: true
      },
      {
        account_id: account.account_id,
        amount: -15.50,
        merchant_name: "University Dining",
        date: new Date(Date.now() - 172800000),
        is_recurring: false
      },
      {
        account_id: account.account_id,
        amount: 250.00,
        merchant_name: "Tutoring Paycheck",
        date: new Date(Date.now() - 259200000),
        is_recurring: false
      }
    ]
  });

  await prisma.credit_Score.create({
    data: {
      user_id: user.user_id,
      credit_score: 720,
      provider: "Equifax"
    }
  });

  console.log("Database seeded! Test user: test@college.edu / password123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.findFirst({ where: { email: "test@college.edu" } });
  
  if (!user1) {
    console.error("Test user not found, please run seed.js first");
    return;
  }

  // Create roommate
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);
  let user2 = await prisma.user.findFirst({ where: { email: "roommate@college.edu" } });
  if (!user2) {
    user2 = await prisma.user.create({
      data: { email: "roommate@college.edu", password_hash }
    });
  }

  // Create group
  const group = await prisma.roommate_Group.create({
    data: { group_name: "The College House" }
  });

  // Link users
  await prisma.user.update({ where: { user_id: user1.user_id }, data: { roommate_group_id: group.group_id } });
  await prisma.user.update({ where: { user_id: user2.user_id }, data: { roommate_group_id: group.group_id } });

  // Add a shared expense paid by user1 (Electric Bill, $120)
  const expense1 = await prisma.shared_Expense.create({
    data: {
      group_id: group.group_id,
      paid_by_user_id: user1.user_id,
      amount: 120.00,
      description: "May Electric Bill"
    }
  });

  // Roommate owes user1 $60
  await prisma.expense_Split.create({
    data: {
      expense_id: expense1.expense_id,
      owed_by_user_id: user2.user_id,
      amount_owed: 60.00
    }
  });

  // Add a shared expense paid by user2 (Internet, $80)
  const expense2 = await prisma.shared_Expense.create({
    data: {
      group_id: group.group_id,
      paid_by_user_id: user2.user_id,
      amount: 80.00,
      description: "May Internet"
    }
  });

  // user1 owes Roommate $40
  await prisma.expense_Split.create({
    data: {
      expense_id: expense2.expense_id,
      owed_by_user_id: user1.user_id,
      amount_owed: 40.00
    }
  });

  console.log("Roommate seed completed! Roommate owes $60, User owes $40. Net: Roommate owes User $20.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

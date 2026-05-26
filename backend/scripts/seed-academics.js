const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "test@college.edu" }
  });

  if (!user) {
    console.error("Test user not found, please run seed.js first");
    return;
  }

  await prisma.academic_Term.create({
    data: {
      user_id: user.user_id,
      semester_name: "Fall 2026",
      tuition_total: 15400.00,
      aid_applied: 10200.00,
      dining_dollars_bal: 450.00
    }
  });

  console.log("Academics seed completed!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

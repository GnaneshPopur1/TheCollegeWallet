const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Create a new group
router.post('/group', authenticateToken, async (req, res) => {
  try {
    const { group_name } = req.body;
    
    // Create the group and immediately join the creating user
    const group = await prisma.roommate_Group.create({
      data: { group_name }
    });

    await prisma.user.update({
      where: { user_id: req.user.user_id },
      data: { roommate_group_id: group.group_id }
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's current group and balances
router.get('/group', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      include: { Roommate_Group: { include: { Users: true } } }
    });

    if (!user.roommate_group_id) {
      return res.json({ group: null });
    }

    // Get net balances for the user (how much this user owes/is owed)
    const splitsOwedByMe = await prisma.expense_Split.findMany({
      where: { owed_by_user_id: req.user.user_id, is_settled: false },
      include: { expense: true }
    });

    const splitsOwedToMe = await prisma.expense_Split.findMany({
      where: { expense: { paid_by_user_id: req.user.user_id }, is_settled: false },
      include: { ower: { select: { email: true } } }
    });

    let totalIOwe = 0;
    splitsOwedByMe.forEach(s => totalIOwe += s.amount_owed);

    let totalOwedToMe = 0;
    splitsOwedToMe.forEach(s => totalOwedToMe += s.amount_owed);

    res.json({
      group: user.Roommate_Group,
      ledger: {
        totalIOwe,
        totalOwedToMe,
        netBalance: totalOwedToMe - totalIOwe
      },
      splitsOwedByMe,
      splitsOwedToMe
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a shared expense
router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      include: { Roommate_Group: { include: { Users: true } } }
    });

    if (!user.roommate_group_id) return res.status(400).json({ error: 'Not in a roommate group' });

    const groupUsers = user.Roommate_Group.Users;
    const splitAmount = amount / groupUsers.length;

    // Create the expense
    const expense = await prisma.shared_Expense.create({
      data: {
        group_id: user.roommate_group_id,
        paid_by_user_id: user.user_id,
        amount,
        description
      }
    });

    // Create splits for everyone else in the group
    const splitsToCreate = groupUsers
      .filter(u => u.user_id !== user.user_id)
      .map(u => ({
        expense_id: expense.expense_id,
        owed_by_user_id: u.user_id,
        amount_owed: splitAmount
      }));

    if (splitsToCreate.length > 0) {
      await prisma.expense_Split.createMany({
        data: splitsToCreate
      });
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent expenses
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: req.user.user_id } });
    if (!user.roommate_group_id) return res.json([]);

    const expenses = await prisma.shared_Expense.findMany({
      where: { group_id: user.roommate_group_id },
      orderBy: { date: 'desc' },
      include: { payer: { select: { email: true } }, Splits: { include: { ower: { select: { email: true } } } } }
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark split as settled
router.patch('/splits/:splitId/settle', authenticateToken, async (req, res) => {
  try {
    await prisma.expense_Split.update({
      where: { split_id: req.params.splitId },
      data: { is_settled: true }
    });
    res.json({ message: 'Split settled' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

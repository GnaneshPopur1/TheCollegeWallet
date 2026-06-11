const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { user_id: req.user.user_id },
      select: { account_id: true, account_type: true, current_balance: true }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:accountId/transactions', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Validate account ownership
    const account = await prisma.account.findFirst({
      where: { account_id: req.params.accountId, user_id: req.user.user_id }
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const transactions = await prisma.transaction.findMany({
      where: { account_id: req.params.accountId },
      take: limit,
      skip: offset,
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    // Find recurring transactions for user's accounts
    const subscriptions = await prisma.transaction.findMany({
      where: { 
        is_recurring: true,
        account: { user_id: req.user.user_id }
      },
      orderBy: { date: 'desc' }
    });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/roundups/simulate', authenticateToken, async (req, res) => {
  try {
    // Fetch all negative transactions (expenses)
    const transactions = await prisma.transaction.findMany({
      where: { 
        amount: { lt: 0 },
        account: { user_id: req.user.user_id }
      }
    });

    let totalRoundup = 0;
    for (const t of transactions) {
      const absAmount = Math.abs(t.amount);
      const ceil = Math.ceil(absAmount);
      const roundup = ceil - absAmount;
      totalRoundup += roundup;
    }

    // Update user's round up balance
    const updatedUser = await prisma.user.update({
      where: { user_id: req.user.user_id },
      data: {
        round_up_balance: { increment: totalRoundup }
      }
    });

    res.json({ success: true, newBalance: updatedUser.round_up_balance, calculatedRoundup: totalRoundup });
  } catch (error) {
    console.error('Roundup Error:', error);
    res.status(500).json({ error: 'Failed to simulate roundups' });
  }
});

module.exports = router;

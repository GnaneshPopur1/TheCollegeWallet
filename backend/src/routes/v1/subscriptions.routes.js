const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Get all subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { user_id: req.user.user_id },
      orderBy: { date_found: 'desc' }
    });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simulate AI Deep Scan
router.post('/scan-footprint', authenticateToken, async (req, res) => {
  try {
    // Look at user's existing subscriptions to see if we already scanned
    const existing = await prisma.subscription.findMany({
      where: { user_id: req.user.user_id }
    });

    if (existing.length > 0) {
      return res.json({ message: 'Scan complete', subscriptions: existing });
    }

    // Simulate AI scanning transactions and digital footprint
    const mockFound = [
      { merchant_name: 'Netflix', amount: 15.99 },
      { merchant_name: 'Spotify Premium', amount: 10.99 },
      { merchant_name: 'Gym Membership', amount: 45.00 },
      { merchant_name: 'Amazon Prime', amount: 14.99 }
    ];

    const created = await prisma.$transaction(
      mockFound.map(sub => 
        prisma.subscription.create({
          data: {
            user_id: req.user.user_id,
            merchant_name: sub.merchant_name,
            amount: sub.amount,
            status: 'ACTIVE'
          }
        })
      )
    );

    res.status(201).json({ message: 'AI found new subscriptions', subscriptions: created });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a subscription (simulate AI agent)
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await prisma.subscription.updateMany({
      where: { 
        subscription_id: req.params.id,
        user_id: req.user.user_id
      },
      data: { status: 'CANCELLED' }
    });

    if (subscription.count === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

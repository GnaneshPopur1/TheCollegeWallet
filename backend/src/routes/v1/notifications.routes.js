const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Save Push Subscription
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    // Upsert subscription based on endpoint
    const existingSub = await prisma.push_Subscription.findFirst({
      where: { endpoint }
    });

    if (existingSub) {
      await prisma.push_Subscription.update({
        where: { sub_id: existingSub.sub_id },
        data: { user_id: req.user.user_id, p256dh: keys.p256dh, auth: keys.auth }
      });
    } else {
      await prisma.push_Subscription.create({
        data: {
          user_id: req.user.user_id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth
        }
      });
    }

    res.status(201).json({ success: true, message: 'Subscription saved.' });
  } catch (error) {
    console.error('Push Sub Error:', error);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

module.exports = router;

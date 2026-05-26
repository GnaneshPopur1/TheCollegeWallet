const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

// In production, these should be in .env
const publicVapidKey = 'BGGFPOvmB9PP-ZC3WthhNF3t8-4AHqaivta5CDcqILPNT1boj2kwqiX7M0EL2rxJAa0VkTg8rBp1puyZcjUd7Pw';
const privateVapidKey = 'ZosWBPgOhfMkGGgwLrZhdmWe1cx-ac0r89VVxnyhXk0';

webpush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Subscribe to push notifications
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const subscription = req.body;

    // The subscription has endpoint and keys { p256dh, auth }
    await prisma.push_Subscription.create({
      data: {
        user_id: req.user.user_id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to trigger a notification
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const subs = await prisma.push_Subscription.findMany({
      where: { user_id: req.user.user_id }
    });

    if (subs.length === 0) {
      return res.status(400).json({ error: 'No active subscriptions found' });
    }

    const payload = JSON.stringify({
      notification: {
        title: 'TheWallet Alert',
        body: 'This is a test notification from TheWallet!',
        icon: '/icons/icon-192x192.png'
      }
    });

    for (let sub of subs) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
      } catch (err) {
        console.error('Error sending notification, removing sub:', err);
        await prisma.push_Subscription.delete({ where: { sub_id: sub.sub_id } });
      }
    }

    res.json({ message: 'Notifications sent' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

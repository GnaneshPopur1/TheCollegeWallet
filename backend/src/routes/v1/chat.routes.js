const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Get chat messages for a group
router.get('/:group_id', authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;
    
    // Verify user belongs to this group
    const user = await prisma.user.findUnique({ where: { user_id: req.user.user_id } });
    if (user.roommate_group_id !== group_id) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { group_id },
      include: {
        user: {
          select: { email: true }
        }
      },
      orderBy: { created_at: 'asc' },
      take: 100 // Limit to last 100 messages for MVP
    });

    res.json(messages);
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new chat message
router.post('/:group_id', authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;
    const { text } = req.body;
    
    const user = await prisma.user.findUnique({ where: { user_id: req.user.user_id } });
    if (user.roommate_group_id !== group_id) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        group_id,
        user_id: req.user.user_id,
        text: text.trim()
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Post Message Error:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

module.exports = router;

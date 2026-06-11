const express = require('express');
const router = express.Router();
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

router.get('/history', authenticateToken, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - months);
    
    const history = await prisma.credit_Score.findMany({
      where: { 
        user_id: req.user.user_id,
        recorded_at: { gte: dateLimit }
      },
      orderBy: { recorded_at: 'asc' },
      select: { credit_score: true, recorded_at: true }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Mock fetching new score from Experian/VantageScore API
    const newScore = Math.floor(Math.random() * (800 - 650) + 650); // Random score between 650 and 800
    
    const scoreRecord = await prisma.credit_Score.create({
      data: {
        user_id: req.user.user_id,
        credit_score: newScore,
        provider: 'VantageScore',
        recorded_at: new Date()
      }
    });
    res.status(201).json(scoreRecord);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

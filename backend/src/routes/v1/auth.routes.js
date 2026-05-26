const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db');
const { authenticateToken } = require('../../middleware/auth.middleware');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Generate simple verification token
    const verification_token = require('crypto').randomBytes(20).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        verification_token
      }
    });

    // Mock sending email
    console.log(`\n\n[MOCK EMAIL] To: ${email}`);
    console.log(`Subject: Verify your email for TheWallet`);
    console.log(`Click this link to verify: http://localhost:3000/api/v1/auth/verify-email/${verification_token}\n\n`);

    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ token, message: 'User created successfully', user_id: user.user_id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    // Assuming MFA is passed or disabled for MVP simplicity, we issue the token here
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, message: 'Logged in successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/mfa/verify', authenticateToken, async (req, res) => {
  // Mock MFA verify
  res.json({ message: 'MFA verified successfully' });
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { user_id: req.user.user_id },
      select: { user_id: true, email: true, created_at: true, round_up_balance: true, venmo_handle: true, is_email_verified: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { venmo_handle } = req.body;
    const user = await prisma.user.update({
      where: { user_id: req.user.user_id },
      data: { venmo_handle },
      select: { user_id: true, email: true, venmo_handle: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({ where: { verification_token: token } });
    
    if (!user) {
      return res.status(400).send('Invalid or expired verification link.');
    }
    
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { is_email_verified: true, verification_token: null }
    });
    
    res.send('<h1>Email Verified Successfully!</h1><p>You can now return to the app.</p>');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

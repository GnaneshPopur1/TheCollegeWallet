require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200', // Angular default port
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Body parser
app.use(express.json());

// Routes
const authRoutes = require('./routes/v1/auth.routes');
const connectionRoutes = require('./routes/v1/connections.routes');
const accountRoutes = require('./routes/v1/accounts.routes');
const academicRoutes = require('./routes/v1/academics.routes');
const roommatesRoutes = require('./routes/v1/roommates.routes');
const creditRoutes = require('./routes/v1/credit.routes');
const plaidRoutes = require('./routes/v1/plaid.routes');
const receiptRoutes = require('./routes/v1/receipts.routes');
const chatRoutes = require('./routes/v1/chat.routes');
const notificationsRoutes = require('./routes/v1/notifications.routes');
const subscriptionsRoutes = require('./routes/v1/subscriptions.routes');
const budgetsRoutes = require('./routes/v1/budgets.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/academics', academicRoutes);
app.use('/api/v1/roommates', roommatesRoutes);
app.use('/api/v1/credit', creditRoutes);
app.use('/api/v1/plaid', plaidRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/subscriptions', subscriptionsRoutes);
app.use('/api/v1/budgets', budgetsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,//15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const templateRoutes = require('./routes/templates');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', apiLimiter);

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    const defaultEmail = process.env.DEFAULT_EMAIL;
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    
    const existingUser = await User.findOne({ email: defaultEmail });
    if (!existingUser) {
      const defaultUser = new User({ email: defaultEmail, password: defaultPassword });
      await defaultUser.save();
      console.log(`Default user created: ${defaultEmail}`);
    } else {
      console.log(`Default user already exists: ${defaultEmail}`);
    }
  })
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/templates', templateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
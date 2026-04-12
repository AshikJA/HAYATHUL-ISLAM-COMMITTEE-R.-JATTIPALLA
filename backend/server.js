const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const templateRoutes = require('./routes/templates');

const app = express();

app.use(cors());
app.use(express.json());

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker')
  .then(async () => {
    console.log('MongoDB Connected');
    
    const defaultEmail = 'aqwuiop09@gmail.com';
    const defaultPassword = '987654321';
    
    const existingUser = await User.findOne({ email: defaultEmail });
    if (!existingUser) {
      const defaultUser = new User({ email: defaultEmail, password: defaultPassword });
      await defaultUser.save();
      console.log('Default user created: aqwuiop09@gmail.com');
    } else {
      console.log('Default user already exists');
    }
  })
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/templates', templateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
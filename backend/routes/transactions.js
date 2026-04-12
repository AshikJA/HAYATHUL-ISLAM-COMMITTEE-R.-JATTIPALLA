const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .lean();
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', validate(schemas.transaction), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { date, description, amount, type } = req.body;

    const transaction = new Transaction({
      user: userId,
      date,
      description,
      amount,
      type
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', validate(schemas.transaction), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { date, description, amount, type } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { date, description, amount, type },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
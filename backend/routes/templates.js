const express = require('express');
const mongoose = require('mongoose');
const Template = require('../models/Template');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

const templateSchema = Joi.object({
  description: Joi.string().min(1).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('Income', 'Expense').required()
});

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const templates = await Template.find({ user: userId }).sort({ createdAt: -1 }).lean();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { error } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const { description, amount, type } = req.body;

    const template = new Template({
      user: userId,
      description,
      amount,
      type
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/use', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const template = await Template.findOne({ _id: req.params.id, user: userId });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const transaction = new Transaction({
      user: userId,
      date: new Date(),
      description: template.description,
      amount: template.amount,
      type: template.type
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { error } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const { description, amount, type } = req.body;

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { description, amount, type },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const template = await Template.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
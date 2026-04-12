const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const userId = new mongoose.Types.ObjectId(req.userId);
    
    const startDate = new Date(year, 0, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year + 1, 0, 1);
    endDate.setHours(0, 0, 0, 0);

    const summary = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' }
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = months.map((month, index) => {
      const monthData = summary.find(s => s._id.month === index + 1);
      const income = monthData?.totalIncome || 0;
      const expenses = monthData?.totalExpenses || 0;
      return {
        month,
        income,
        expenses,
        net: income - expenses
      };
    });

    const grandTotal = result.reduce(
      (acc, item) => ({
        income: acc.income + item.income,
        expenses: acc.expenses + item.expenses,
        net: acc.net + item.net
      }),
      { income: 0, expenses: 0, net: 0 }
    );

    res.json({ summary: result, grandTotal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
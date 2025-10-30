import express from 'express';
import { body, validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Mock exchange rates
const exchangeRates = {
  'USD-EUR': 0.85,
  'USD-GBP': 0.73,
  'USD-CAD': 1.32,
  'USD-PHP': 56.80,
  'USD-INR': 83.15,
  'EUR-USD': 1.18,
  'GBP-USD': 1.37,
  'CAD-USD': 0.76
};

// Calculate transfer fee
const calculateFee = (type, amount, isInternational = false) => {
  if (isInternational) {
    return Math.min(amount * 0.03, 25);
  }
  
  const fees = {
    'transfer': 0,
    'deposit': 0,
    'withdrawal': 2.5,
    'payment': 1.5
  };
  return fees[type] || 0;
};

// Create transaction
router.post('/', [
  auth,
  body('fromAccount').isMongoId().withMessage('Valid from account is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['transfer', 'deposit', 'withdrawal', 'payment', 'international']).withMessage('Invalid transaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { fromAccount, toAccount, amount, description, type, category, recipient } = req.body;

    // Verify from account belongs to user
    const sourceAccount = await Account.findOne({
      _id: fromAccount,
      user: req.user.id
    });

    if (!sourceAccount) {
      return res.status(404).json({ 
        message: 'Source account not found' 
      });
    }

    // Check sufficient balance (for withdrawals and transfers)
    if (['withdrawal', 'transfer', 'payment', 'international'].includes(type)) {
      const fee = calculateFee(type, amount, type === 'international');
      const totalAmount = amount + fee;

      if (sourceAccount.balance < totalAmount) {
        return res.status(400).json({ 
          message: 'Insufficient funds' 
        });
      }
    }

    // For transfers, verify toAccount exists
    let targetAccount = null;
    if (toAccount) {
      targetAccount = await Account.findById(toAccount);
      if (!targetAccount) {
        return res.status(404).json({ 
          message: 'Destination account not found' 
        });
      }
    }

    const fee = calculateFee(type, amount, type === 'international');
    const exchangeRate = type === 'international' ? (exchangeRates[`${sourceAccount.currency}-${recipient?.currency}`] || 1) : 1;

    const transaction = new Transaction({
      fromAccount,
      toAccount,
      amount,
      currency: sourceAccount.currency,
      description,
      type,
      category,
      fee,
      exchangeRate,
      recipient,
      status: 'completed' // In real app, this might be pending
    });

    await transaction.save();

    // Update account balances
    if (['withdrawal', 'payment', 'international'].includes(type)) {
      sourceAccount.balance -= (amount + fee);
    } else if (type === 'transfer' && targetAccount) {
      sourceAccount.balance -= (amount + fee);
      targetAccount.balance += amount;
      await targetAccount.save();
    } else if (type === 'deposit') {
      sourceAccount.balance += amount;
    }

    await sourceAccount.save();

    // Update user rewards
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardsBalance: Math.floor(amount * 0.01) } // 1 point per dollar
    });

    await transaction.populate('fromAccount', 'accountNumber type');
    await transaction.populate('toAccount', 'accountNumber type');

    res.status(201).json({
      message: 'Transaction completed successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating transaction' 
    });
  }
});

// Get user transactions
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, accountId } = req.query;
    
    // Get user's accounts
    const userAccounts = await Account.find({ user: req.user.id });
    const accountIds = userAccounts.map(acc => acc._id);

    let query = {
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    };

    if (accountId) {
      query = {
        $or: [
          { fromAccount: accountId },
          { toAccount: accountId }
        ]
      };
    }

    const transactions = await Transaction.find(query)
      .populate('fromAccount', 'accountNumber type')
      .populate('toAccount', 'accountNumber type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      message: 'Server error fetching transactions' 
    });
  }
});

export default router;
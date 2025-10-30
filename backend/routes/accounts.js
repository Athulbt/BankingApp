import express from 'express';
import { body, validationResult } from 'express-validator';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all accounts for user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ 
      message: 'Server error fetching accounts' 
    });
  }
});

// Get account by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!account) {
      return res.status(404).json({ 
        message: 'Account not found' 
      });
    }

    // Get recent transactions
    const transactions = await Transaction.find({
      $or: [
        { fromAccount: account._id },
        { toAccount: account._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('fromAccount', 'accountNumber')
    .populate('toAccount', 'accountNumber');

    res.json({
      account,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ 
      message: 'Server error fetching account' 
    });
  }
});

// Create new account
router.post('/', [
  auth,
  body('type').isIn(['checking', 'savings', 'business', 'investment']).withMessage('Invalid account type'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { type, currency } = req.body;

    const account = new Account({
      user: req.user.id,
      type,
      currency,
      balance: 0
    });

    await account.save();

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ 
      message: 'Server error creating account' 
    });
  }
});

export default router;
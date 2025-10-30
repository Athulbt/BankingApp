import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('accounts')
      .select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Server error fetching profile' 
    });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone, address } = req.body;
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile' 
    });
  }
});

// Get user dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('accounts');
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [
        { fromAccount: { $in: user.accounts.map(acc => acc._id) } },
        { toAccount: { $in: user.accounts.map(acc => acc._id) } }
      ]
    })
    .populate('fromAccount', 'accountNumber type')
    .populate('toAccount', 'accountNumber type')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate total balance
    const totalBalance = user.accounts.reduce((sum, account) => sum + account.balance, 0);

    // Get account types count
    const accountTypes = user.accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rewardsBalance: user.rewardsBalance
      },
      accounts: user.accounts,
      totalBalance,
      accountTypes,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Server error fetching dashboard data' 
    });
  }
});

// Get user rewards
router.get('/rewards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('rewardsBalance name');
    
    res.json({
      rewardsBalance: user.rewardsBalance,
      userName: user.name
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ 
      message: 'Server error fetching rewards' 
    });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { currency, notifications } = req.body;
    const updateFields = {};
    
    if (currency) updateFields.currency = currency;
    if (notifications !== undefined) updateFields.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      message: 'Server error updating preferences' 
    });
  }
});

export default router;
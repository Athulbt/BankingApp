import express from 'express';
import mongoose from 'mongoose';
import { body, query, validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Mock exchange rates (demo only)
const exchangeRates = {
  'USD-EUR': 0.85,
  'USD-GBP': 0.73,
  'USD-CAD': 1.32,
  'USD-AUD': 1.52,
  'USD-PHP': 56.80,
  'USD-INR': 83.15,
  'EUR-USD': 1.18,
  'GBP-USD': 1.37,
  'CAD-USD': 0.76
};

// Types a user is allowed to create. Deposits are not user-initiated:
// letting a client "deposit" would create money out of nothing.
const USER_TYPES = ['transfer', 'withdrawal', 'payment', 'international'];
const MAX_AMOUNT = 1000000;

// Round to whole cents to avoid floating-point drift
const toCents = (n) => Math.round(n * 100) / 100;

// Calculate transfer fee (keep in sync with frontend/src/pages/Transfer.jsx)
export const calculateFee = (type, amount) => {
  if (type === 'international') {
    return toCents(Math.min(amount * 0.03, 25));
  }
  const fees = {
    transfer: 0,
    withdrawal: 2.5,
    payment: 1.5
  };
  return fees[type] || 0;
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Create transaction
router.post('/', [
  auth,
  body('fromAccount').isMongoId().withMessage('Valid from account is required'),
  body('toAccount').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid destination account'),
  // toFloat() makes sure amount is a real number, not a string like "100"
  body('amount')
    .isFloat({ min: 0.01, max: MAX_AMOUNT })
    .withMessage(`Amount must be between 0.01 and ${MAX_AMOUNT}`)
    .toFloat(),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 200 }),
  body('type').isIn(USER_TYPES).withMessage('Invalid transaction type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { fromAccount, toAccount, description, type, category, recipient } = req.body;
  const amount = toCents(req.body.amount);

  if (type === 'transfer') {
    if (!toAccount) {
      return res.status(400).json({ message: 'Destination account is required for transfers' });
    }
    if (toAccount === fromAccount) {
      return res.status(400).json({ message: 'Cannot transfer to the same account' });
    }
  }

  const fee = calculateFee(type, amount);
  const total = toCents(amount + fee);
  const exchangeRate = type === 'international'
    ? (exchangeRates[`USD-${recipient?.currency}`] || 1)
    : 1;

  const session = await mongoose.startSession();
  let transaction;
  let isInternal = false;

  try {
    await session.withTransaction(async () => {
      // Atomically debit only if the account belongs to the user, is active
      // and has enough money. Doing check + update in one step prevents
      // two simultaneous requests from spending the same money twice.
      const sourceAccount = await Account.findOneAndUpdate(
        { _id: fromAccount, user: req.user.id, isActive: true, balance: { $gte: total } },
        { $inc: { balance: -total } },
        { new: true, session }
      );

      if (!sourceAccount) {
        const exists = await Account.exists({ _id: fromAccount, user: req.user.id }).session(session);
        throw exists
          ? new HttpError(400, 'Insufficient funds')
          : new HttpError(404, 'Source account not found');
      }

      if (type === 'transfer') {
        const targetAccount = await Account.findOneAndUpdate(
          { _id: toAccount, isActive: true },
          { $inc: { balance: amount } },
          { new: true, session }
        );
        if (!targetAccount) {
          throw new HttpError(404, 'Destination account not found');
        }
        isInternal = String(targetAccount.user) === String(req.user.id);
      }

      [transaction] = await Transaction.create([{
        fromAccount,
        toAccount: type === 'transfer' ? toAccount : undefined,
        amount,
        currency: sourceAccount.currency,
        description,
        type,
        category,
        fee,
        exchangeRate,
        recipient: type === 'transfer' ? undefined : recipient,
        status: 'completed',
        completedAt: new Date()
      }], { session });

      // Rewards: 1 point per whole dollar spent. Moving money between your
      // own accounts doesn't earn points.
      if (!isInternal) {
        await User.updateOne(
          { _id: req.user.id },
          { $inc: { rewardsBalance: Math.floor(amount) } },
          { session }
        );
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Transaction creation error:', error);
    return res.status(500).json({ message: 'Server error creating transaction' });
  } finally {
    await session.endSession();
  }

  await transaction.populate('fromAccount', 'accountNumber type');
  await transaction.populate('toAccount', 'accountNumber type');

  res.status(201).json({
    message: 'Transaction completed successfully',
    transaction
  });
});

// Get user transactions
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('accountId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const { accountId } = req.query;

    // Only ever look at the logged-in user's own accounts
    const userAccounts = await Account.find({ user: req.user.id }).select('_id');
    const ownIds = userAccounts.map(acc => String(acc._id));

    if (accountId && !ownIds.includes(accountId)) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const accountIds = accountId ? [accountId] : ownIds;
    const query = {
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    };

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('fromAccount', 'accountNumber type')
        .populate('toAccount', 'accountNumber type')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),
      Transaction.countDocuments(query)
    ]);

    // netAmount = effect on this user's total money:
    // positive = money in, negative = money out, 0 = between own accounts
    const withNet = transactions.map((t) => {
      const obj = t.toJSON();
      const fromOwn = ownIds.includes(String(t.fromAccount?._id));
      const toOwn = ownIds.includes(String(t.toAccount?._id));
      const cost = toCents(t.amount + (t.fee || 0));

      if (t.type === 'deposit') obj.netAmount = t.amount;
      else if (fromOwn && toOwn) obj.netAmount = -(t.fee || 0);
      else if (fromOwn) obj.netAmount = -cost;
      else if (toOwn) obj.netAmount = t.amount;
      else obj.netAmount = 0;

      obj.direction = fromOwn && toOwn ? 'internal' : obj.netAmount >= 0 ? 'in' : 'out';
      return obj;
    });

    res.json({
      transactions: withNet,
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

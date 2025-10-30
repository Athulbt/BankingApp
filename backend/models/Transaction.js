import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  type: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'international'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be at least 0.01']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'shopping', 'bills', 'entertainment', 'transport', 'healthcare', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  fee: {
    type: Number,
    default: 0
  },
  recipient: {
    name: String,
    accountNumber: String,
    bankName: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Index for faster queries
TransactionSchema.index({ fromAccount: 1, createdAt: -1 });
TransactionSchema.index({ toAccount: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });

export default mongoose.model('Transaction', TransactionSchema);
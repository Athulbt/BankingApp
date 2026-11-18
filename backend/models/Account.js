import crypto from 'crypto';
import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    unique: true
    // Removed required: true to let pre-save hook handle it
  },
  type: {
    type: String,
    enum: ['checking', 'savings', 'business', 'investment'],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interestRate: {
    type: Number,
    default: 0.5
  },
  overdraftLimit: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a random account number before validation.
// crypto.randomInt is unpredictable, and 10 random digits make collisions
// very unlikely (the unique index still guards against them).
AccountSchema.pre('validate', function(next) {
  if (!this.accountNumber) {
    this.accountNumber = 'BA' + crypto.randomInt(0, 1e10).toString().padStart(10, '0');
  }
  next();
});

export default mongoose.model('Account', AccountSchema);
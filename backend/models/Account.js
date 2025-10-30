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

// Generate account number before saving - FIXED VERSION
AccountSchema.pre('save', function(next) {
  console.log('Pre-save hook running for Account');
  console.log('Current accountNumber:', this.accountNumber);
  
  if (!this.accountNumber) {
    // Generate a unique account number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.accountNumber = 'BA' + timestamp.slice(-8) + random;
    console.log('Generated account number:', this.accountNumber);
  }
  next();
});

// Also add pre-validate hook to ensure it runs before validation
AccountSchema.pre('validate', function(next) {
  console.log('Pre-validate hook running');
  if (!this.accountNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.accountNumber = 'BA' + timestamp.slice(-8) + random;
    console.log('Generated account number in pre-validate:', this.accountNumber);
  }
  next();
});

export default mongoose.model('Account', AccountSchema);
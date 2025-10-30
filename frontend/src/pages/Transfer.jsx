import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Transfer = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferType, setTransferType] = useState('internal');
  
  // Form state
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    recipientName: '',
    recipientBank: '',
    recipientAccount: '',
    recipientCountry: 'US'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          fromAccount: res.data[0]._id
        }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Mock data
      setAccounts([
        { _id: '1', accountNumber: '4582761890', type: 'checking', balance: 1250.75 },
        { _id: '2', accountNumber: '7391852341', type: 'savings', balance: 5430.25 }
      ]);
      setFormData(prev => ({ ...prev, fromAccount: '1' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateFee = () => {
    if (transferType === 'internal') return 0;
    if (transferType === 'domestic') return 2.50;
    if (transferType === 'international') return 15.00;
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        fromAccount: formData.fromAccount,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Money Transfer',
        type: transferType === 'internal' ? 'transfer' : 'international'
      };

      if (transferType === 'internal') {
        transactionData.toAccount = formData.toAccount;
      } else {
        transactionData.recipient = {
          name: formData.recipientName,
          bankName: formData.recipientBank,
          accountNumber: formData.recipientAccount,
          country: formData.recipientCountry
        };
      }

      const res = await axios.post('/api/transactions', transactionData);
      
      alert('Transfer initiated successfully!');
      // Reset form
      setFormData({
        fromAccount: accounts[0]?._id || '',
        toAccount: '',
        amount: '',
        description: '',
        recipientName: '',
        recipientBank: '',
        recipientAccount: '',
        recipientCountry: 'US'
      });
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fromAccount = accounts.find(acc => acc._id === formData.fromAccount);
  const fee = calculateFee();
  const totalAmount = parseFloat(formData.amount || 0) + fee;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Money</h1>
        <p className="text-gray-600">Send money securely to any account</p>
      </div>

      {/* Transfer Type Selector */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Transfer Type</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'internal', label: 'Internal Transfer', desc: 'Between your accounts' },
            { value: 'domestic', label: 'Domestic Transfer', desc: 'Within your country' },
            { value: 'international', label: 'International', desc: 'To other countries' }
          ].map((type) => (
            <div
              key={type.value}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                transferType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTransferType(type.value)}
            >
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600">{type.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Account
            </label>
            <select
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.type === 'checking' ? 'Checking' : 'Savings'} - ****{account.accountNumber?.slice(-4)} 
                  (${account.balance?.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* To Account - Internal Transfer */}
          {transferType === 'internal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                name="toAccount"
                value={formData.toAccount}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select account</option>
                {accounts
                  .filter(acc => acc._id !== formData.fromAccount)
                  .map(account => (
                    <option key={account._id} value={account._id}>
                      {account.type === 'checking' ? 'Checking' : 'Savings'} - ****{account.accountNumber?.slice(-4)}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Recipient Details - External Transfers */}
          {transferType !== 'internal' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recipient Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  className="input-field"
                  required={transferType !== 'internal'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="recipientBank"
                  value={formData.recipientBank}
                  onChange={handleInputChange}
                  className="input-field"
                  required={transferType !== 'internal'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="recipientAccount"
                  value={formData.recipientAccount}
                  onChange={handleInputChange}
                  className="input-field"
                  required={transferType !== 'internal'}
                />
              </div>

              {transferType === 'international' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="recipientCountry"
                    value={formData.recipientCountry}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="flex">
              <span className="flex items-center justify-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                $
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field rounded-l-none"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Rent payment, Gift, etc."
            />
          </div>

          {/* Transfer Summary */}
          {formData.amount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Transfer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transfer Amount:</span>
                  <span>${parseFloat(formData.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transfer Fee:</span>
                  <span>${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                {fromAccount && totalAmount > fromAccount.balance && (
                  <p className="text-red-600 text-sm mt-2">
                    Insufficient funds. Available: ${fromAccount.balance.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (fromAccount && totalAmount > fromAccount.balance)}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Send $${(parseFloat(formData.amount) || 0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;
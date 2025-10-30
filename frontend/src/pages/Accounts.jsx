import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Accounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccountType, setNewAccountType] = useState('checking');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Mock data for development
      setAccounts([
        {
          _id: '1',
          accountNumber: '4582761890',
          type: 'checking',
          balance: 1250.75,
          currency: 'USD',
          interestRate: 0.1,
          isActive: true
        },
        {
          _id: '2',
          accountNumber: '7391852341',
          type: 'savings',
          balance: 5430.25,
          currency: 'USD',
          interestRate: 2.5,
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createNewAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/accounts', {
        type: newAccountType,
        currency: 'USD'
      });
      setAccounts([...accounts, res.data.account]);
      setShowNewAccountForm(false);
      setNewAccountType('checking');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    }
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      checking: 'from-blue-500 to-blue-600',
      savings: 'from-green-500 to-green-600',
      business: 'from-purple-500 to-purple-600',
      investment: 'from-orange-500 to-orange-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getAccountTypeName = (type) => {
    const names = {
      checking: 'Checking Account',
      savings: 'Savings Account',
      business: 'Business Account',
      investment: 'Investment Account'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Accounts</h1>
        <button
          onClick={() => setShowNewAccountForm(true)}
          className="btn-primary"
        >
          + New Account
        </button>
      </div>

      {/* New Account Form */}
      {showNewAccountForm && (
        <div className="card max-w-md">
          <h3 className="text-lg font-semibold mb-4">Open New Account</h3>
          <form onSubmit={createNewAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value)}
                className="input-field"
              >
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="business">Business Account</option>
                <option value="investment">Investment Account</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary flex-1">
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowNewAccountForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div
            key={account._id}
            className={`account-card bg-gradient-to-r ${getAccountTypeColor(account.type)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {getAccountTypeName(account.type)}
                </h3>
                <p className="text-blue-100 text-sm">**** {account.accountNumber?.slice(-4) || '0000'}</p>
              </div>
              <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                {account.currency}
              </span>
            </div>
            
            <p className="text-3xl font-bold text-shadow mb-2">
              ${account.balance?.toFixed(2) || '0.00'}
            </p>
            
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex justify-between text-sm text-blue-100">
                <span>Interest Rate:</span>
                <span>{account.interestRate}%</span>
              </div>
              <div className="flex justify-between text-sm text-blue-100 mt-1">
                <span>Status:</span>
                <span className={account.isActive ? 'text-green-300' : 'text-red-300'}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-3 rounded text-sm transition-colors">
                View Details
              </button>
              <button className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-3 rounded text-sm transition-colors">
                Transfer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ${accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Active Accounts</p>
          <p className="text-2xl font-bold text-gray-900">
            {accounts.filter(acc => acc.isActive).length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Rewards Points</p>
          <p className="text-2xl font-bold text-gray-900">{user?.rewardsBalance || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
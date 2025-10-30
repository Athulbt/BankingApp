import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: '30days'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filters, searchTerm]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions');
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mock data
      setTransactions([
        {
          _id: '1',
          description: 'Salary Deposit',
          amount: 2500.00,
          type: 'deposit',
          category: 'income',
          status: 'completed',
          createdAt: '2024-01-15T10:30:00Z',
          fromAccount: { accountNumber: '4582761890', type: 'checking' }
        },
        {
          _id: '2',
          description: 'Grocery Store',
          amount: -85.43,
          type: 'payment',
          category: 'food',
          status: 'completed',
          createdAt: '2024-01-14T16:45:00Z',
          fromAccount: { accountNumber: '4582761890', type: 'checking' }
        },
        {
          _id: '3',
          description: 'Electric Bill',
          amount: -120.75,
          type: 'payment',
          category: 'bills',
          status: 'completed',
          createdAt: '2024-01-12T09:15:00Z',
          fromAccount: { accountNumber: '4582761890', type: 'checking' }
        },
        {
          _id: '4',
          description: 'Transfer to Savings',
          amount: -500.00,
          type: 'transfer',
          category: 'savings',
          status: 'completed',
          createdAt: '2024-01-10T14:20:00Z',
          fromAccount: { accountNumber: '4582761890', type: 'checking' },
          toAccount: { accountNumber: '7391852341', type: 'savings' }
        },
        {
          _id: '5',
          description: 'Online Shopping',
          amount: -45.99,
          type: 'payment',
          category: 'shopping',
          status: 'completed',
          createdAt: '2024-01-08T11:30:00Z',
          fromAccount: { accountNumber: '4582761890', type: 'checking' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filter by date range
    const now = new Date();
    if (filters.dateRange === '7days') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(t => new Date(t.createdAt) >= weekAgo);
    } else if (filters.dateRange === '30days') {
      const monthAgo = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter(t => new Date(t.createdAt) >= monthAgo);
    } else if (filters.dateRange === '90days') {
      const threeMonthsAgo = new Date(now.setDate(now.getDate() - 90));
      filtered = filtered.filter(t => new Date(t.createdAt) >= threeMonthsAgo);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.fromAccount?.accountNumber && t.fromAccount.accountNumber.includes(searchTerm)) ||
        (t.toAccount?.accountNumber && t.toAccount.accountNumber.includes(searchTerm))
      );
    }

    setFilteredTransactions(filtered);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍔',
      shopping: '🛍️',
      bills: '📄',
      entertainment: '🎬',
      transport: '🚗',
      healthcare: '🏥',
      income: '💰',
      savings: '🏦',
      other: '📊'
    };
    return icons[category] || '📊';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Status'],
      ...filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.description,
        t.amount,
        t.type,
        t.category,
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">View and manage your transactions</p>
        </div>
        <button onClick={exportTransactions} className="btn-secondary">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Search transactions..."
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="payment">Payment</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="shopping">Shopping</option>
              <option value="bills">Bills</option>
              <option value="entertainment">Entertainment</option>
              <option value="transport">Transport</option>
              <option value="healthcare">Healthcare</option>
              <option value="income">Income</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="input-field"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            ${filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ${Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Net Flow</p>
          <p className={`text-2xl font-bold ${
            filteredTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
              >
                {/* Transaction Icon and Description */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{transaction.type}</span>
                      {transaction.fromAccount && (
                        <>
                          <span>•</span>
                          <span>From: ****{transaction.fromAccount.accountNumber?.slice(-4)}</span>
                        </>
                      )}
                      {transaction.toAccount && (
                        <>
                          <span>•</span>
                          <span>To: ****{transaction.toAccount.accountNumber?.slice(-4)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <p className={transaction.amount >= 0 ? 'transaction-income' : 'transaction-expense'}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
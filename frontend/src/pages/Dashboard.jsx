import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        axios.get('/api/accounts'),
        axios.get('/api/transactions?limit=5')
      ]);

      setAccounts(accountsRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bank-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {/* Total Balance */}
      <div className="account-card">
        <h2 className="text-lg font-semibold mb-2">Total Balance</h2>
        <p className="text-3xl font-bold text-shadow">
          ${totalBalance.toFixed(2)}
        </p>
        <p className="text-blue-100 mt-2">Across {accounts.length} accounts</p>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">
                  {account.type} Account
                </h3>
                <p className="text-sm text-gray-500">{account.accountNumber}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {account.currency}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${account.balance.toFixed(2)}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Interest Rate: {account.interestRate}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction._id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={transaction.type === 'deposit' ? 'transaction-income' : 'transaction-expense'}>
                  {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{transaction.currency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import TransactionItem from '../components/TransactionItem';
import { Alert, EmptyState, IconChip, PageHeader, PageLoader, SectionHeader } from '../components/ui';
import { accountInfo, accountLabel, formatCurrency, maskAccount } from '../utils/format';

const DAY = 24 * 60 * 60 * 1000;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const QuickAction = ({ to, icon, label }) => (
  <Link to={to} className="group flex flex-col items-center gap-2 rounded-lg p-3 text-center transition hover:bg-slate-50">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
      <Icon name={icon} className="h-5 w-5" />
    </span>
    <span className="text-xs font-medium text-slate-700">{label}</span>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [accountsRes, transactionsRes] = await Promise.all([
          axios.get('/api/accounts'),
          axios.get('/api/transactions?limit=50')
        ]);
        setAccounts(accountsRes.data);
        setTransactions(transactionsRes.data.transactions || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('We couldn’t load your accounts. Please refresh the page.');
      } finally {
        setLoading(false);
      }
      axios.get('/api/users/rewards')
        .then((res) => setRewards(res.data.rewardsBalance))
        .catch(() => {});
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const since = Date.now() - 30 * DAY;
  const lastMonth = transactions.filter((t) => new Date(t.createdAt).getTime() >= since);
  const moneyIn = lastMonth.filter((t) => t.netAmount > 0).reduce((s, t) => s + t.netAmount, 0);
  const moneyOut = Math.abs(lastMonth.filter((t) => t.netAmount < 0).reduce((s, t) => s + t.netAmount, 0));
  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={today}
        actions={
          <Link to="/transfer" className="btn-primary">
            <Icon name="transfer" className="h-4 w-4" />
            Send money
          </Link>
        }
      />

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Balance panel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-6 text-white shadow-lift sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-brand-400/10" aria-hidden="true" />

          <div className="relative">
            <p className="text-sm font-medium text-slate-300">Total balance</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {formatCurrency(totalBalance)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </p>

            <div className="mt-8 grid max-w-md grid-cols-2 gap-6 border-t border-white/10 pt-6">
              <div>
                <p className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Icon name="arrowDownLeft" className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                  Money in
                </p>
                <p className="mt-2 text-xl font-semibold tabular-nums">{formatCurrency(moneyIn)}</p>
                <p className="text-xs text-slate-400">Last 30 days</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-400/15 text-rose-300">
                    <Icon name="arrowUpRight" className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                  Money out
                </p>
                <p className="mt-2 text-xl font-semibold tabular-nums">{formatCurrency(moneyOut)}</p>
                <p className="text-xs text-slate-400">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Rewards */}
          <div className="card flex items-start justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Reward points</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                {(rewards ?? user?.rewardsBalance ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">1 point for every $1 you send</p>
            </div>
            <IconChip icon="star" className="bg-amber-50 text-amber-500" />
          </div>

          {/* Quick actions */}
          <div className="card flex-1 p-3">
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick actions</p>
            <div className="grid grid-cols-3">
              <QuickAction to="/transfer" icon="transfer" label="Send money" />
              <QuickAction to="/accounts?new=1" icon="plus" label="Open account" />
              <QuickAction to="/transactions" icon="receipt" label="Statements" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Accounts */}
        <section className="card lg:col-span-2">
          <SectionHeader
            title="Your accounts"
            action={<Link to="/accounts" className="link text-sm">View all</Link>}
          />
          {accounts.length === 0 ? (
            <EmptyState icon="bank" title="No accounts yet" description="Open an account to get started." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {accounts.map((account) => {
                const info = accountInfo(account.type);
                return (
                  <li key={account._id}>
                    <Link
                      to={`/transactions?account=${account._id}`}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >
                      <IconChip icon={info.icon} className={info.chip} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{accountLabel(account.type)}</p>
                        <p className="text-xs text-slate-500">{maskAccount(account.accountNumber)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <Icon name="chevronRight" className="h-4 w-4 text-slate-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section className="card lg:col-span-3">
          <SectionHeader
            title="Recent activity"
            action={<Link to="/transactions" className="link text-sm">View all</Link>}
          />
          {transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="When you send or receive money, it will show up here."
              action={<Link to="/transfer" className="btn-secondary">Send money</Link>}
            />
          ) : (
            <ul className="divide-y divide-slate-100 px-5 sm:px-6">
              {transactions.slice(0, 6).map((t) => (
                <TransactionItem key={t._id} transaction={t} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

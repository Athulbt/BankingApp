import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { Alert, Badge, EmptyState, PageHeader, PageLoader, StatCard } from '../components/ui';
import { ACCOUNT_TYPES, accountInfo, formatCurrency, maskAccount } from '../utils/format';

const OpenAccountDialog = ({ onClose, onCreated }) => {
  const [type, setType] = useState('checking');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await axios.post('/api/accounts', { type, currency: 'USD' });
      onCreated(res.data.account);
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t open the account. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-account-title"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 id="open-account-title" className="text-lg font-semibold text-slate-900">Open a new account</h2>
              <p className="mt-1 text-sm text-slate-500">Choose the type of account you want to open.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
              <Icon name="x" />
            </button>
          </div>

          <fieldset className="space-y-3 px-6 py-5">
            <legend className="sr-only">Account type</legend>
            {Object.entries(ACCOUNT_TYPES).map(([value, info]) => {
              const selected = type === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                    selected ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={value}
                    checked={selected}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${info.chip}`}>
                    <Icon name={info.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{info.label} account</span>
                    <span className="block text-sm text-slate-500">{info.description}</span>
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-brand-600' : 'border-slate-300'
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                  </span>
                </label>
              );
            })}
            {error && <Alert>{error}</Alert>}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Opening…' : 'Open account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AccountCard = ({ account }) => {
  const info = accountInfo(account.type);
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className={`relative bg-gradient-to-br ${info.gradient} p-6 text-white`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Icon name={info.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{info.label}</p>
                <p className="font-mono text-xs tracking-wider text-white/70">{maskAccount(account.accountNumber)}</p>
              </div>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{account.currency}</span>
          </div>
          <p className="mt-8 text-xs font-medium uppercase tracking-wider text-white/60">Available balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="px-6 py-3">
          <dt className="text-xs text-slate-500">Interest rate</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">{account.interestRate}%</dd>
        </div>
        <div className="px-6 py-3">
          <dt className="text-xs text-slate-500">Status</dt>
          <dd className="mt-1">
            <Badge tone={account.isActive ? 'success' : 'neutral'}>{account.isActive ? 'Active' : 'Inactive'}</Badge>
          </dd>
        </div>
      </dl>

      <div className="mt-auto grid grid-cols-2 gap-3 p-4">
        <Link to={`/transfer?from=${account._id}`} className="btn-secondary">
          <Icon name="transfer" className="h-4 w-4" />
          Send
        </Link>
        <Link to={`/transactions?account=${account._id}`} className="btn-secondary">
          <Icon name="receipt" className="h-4 w-4" />
          Activity
        </Link>
      </div>
    </div>
  );
};

const Accounts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const showDialog = searchParams.get('new') === '1';

  useEffect(() => {
    axios.get('/api/accounts')
      .then((res) => setAccounts(res.data))
      .catch((err) => {
        console.error('Error fetching accounts:', err);
        setLoadError('We couldn’t load your accounts. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  const openDialog = () => setSearchParams({ new: '1' });
  const closeDialog = () => setSearchParams({});

  const handleCreated = (account) => {
    setAccounts((prev) => [...prev, account]);
    setNotice(`Your new ${accountInfo(account.type).label.toLowerCase()} account is ready.`);
    closeDialog();
  };

  if (loading) return <PageLoader />;

  const total = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        description="Manage your accounts and see their balances."
        actions={
          <button type="button" onClick={openDialog} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Open account
          </button>
        }
      />

      {loadError && <Alert>{loadError}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total balance" value={formatCurrency(total)} icon="bank" iconClass="bg-brand-50 text-brand-600" />
        <StatCard
          label="Open accounts"
          value={accounts.filter((a) => a.isActive).length}
          hint={`${accounts.length} in total`}
          icon="card"
          iconClass="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="Reward points"
          value={(user?.rewardsBalance || 0).toLocaleString()}
          icon="star"
          iconClass="bg-amber-50 text-amber-500"
        />
      </div>

      {accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="bank"
            title="You don’t have any accounts yet"
            description="Open a checking or savings account to start using Banking App."
            action={<button type="button" onClick={openDialog} className="btn-primary">Open account</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account._id} account={account} />
          ))}
          <button
            type="button"
            onClick={openDialog}
            className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
              <Icon name="plus" className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold">Open another account</span>
          </button>
        </div>
      )}

      {showDialog && <OpenAccountDialog onClose={closeDialog} onCreated={handleCreated} />}
    </div>
  );
};

export default Accounts;

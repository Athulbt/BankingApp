import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';
import TransactionItem, { describeTransaction } from '../components/TransactionItem';
import { Alert, EmptyState, IconChip, PageHeader, PageLoader, Spinner, StatCard, StatusBadge } from '../components/ui';
import { accountInfo, formatCurrency, formatDate, maskAccount, TRANSACTION_TYPES } from '../utils/format';

const DAY = 24 * 60 * 60 * 1000;
const DATE_RANGES = { '7days': 7, '30days': 30, '90days': 90, all: null };

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountFilter = searchParams.get('account') || 'all';

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [type, setType] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/accounts').then((res) => setAccounts(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const params = { limit: 100 };
        if (accountFilter !== 'all') params.accountId = accountFilter;
        const res = await axios.get('/api/transactions', { params });
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setLoadError('We couldn’t load your transactions. Please refresh the page.');
      } finally {
        setLoading(false);
        setFirstLoad(false);
      }
    };
    load();
  }, [accountFilter]);

  const filtered = useMemo(() => {
    const days = DATE_RANGES[dateRange];
    const since = days ? Date.now() - days * DAY : 0;
    const q = searchTerm.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (new Date(t.createdAt).getTime() < since) return false;
      if (!q) return true;
      return (
        t.description?.toLowerCase().includes(q) ||
        t.recipient?.name?.toLowerCase().includes(q) ||
        t.fromAccount?.accountNumber?.includes(q) ||
        t.toAccount?.accountNumber?.includes(q)
      );
    });
  }, [transactions, type, dateRange, searchTerm]);

  const net = (t) => t.netAmount ?? 0;
  const moneyIn = filtered.filter((t) => net(t) > 0).reduce((s, t) => s + net(t), 0);
  const moneyOut = Math.abs(filtered.filter((t) => net(t) < 0).reduce((s, t) => s + net(t), 0));
  const netChange = moneyIn - moneyOut;

  const exportCsv = () => {
    const rows = [
      ['Date', 'Description', 'Type', 'Status', 'Amount', 'Fee', 'Net effect', 'From', 'To'],
      ...filtered.map((t) => [
        new Date(t.createdAt).toISOString(),
        t.description,
        TRANSACTION_TYPES[t.type] || t.type,
        t.status,
        t.amount,
        t.fee || 0,
        net(t),
        t.fromAccount?.accountNumber || '',
        t.toAccount?.accountNumber || t.recipient?.name || ''
      ])
    ];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setAccountFilter = (value) => {
    setSearchParams(value === 'all' ? {} : { account: value });
  };

  if (firstLoad) return <PageLoader />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Search, filter and export your account activity."
        actions={
          <button type="button" onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary">
            <Icon name="download" className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {loadError && <Alert>{loadError}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Money in" value={formatCurrency(moneyIn)} icon="arrowDownLeft" iconClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Money out" value={formatCurrency(moneyOut)} icon="arrowUpRight" iconClass="bg-rose-50 text-rose-600" />
        <StatCard
          label="Net change"
          value={`${netChange > 0 ? '+' : netChange < 0 ? '−' : ''}${formatCurrency(Math.abs(netChange))}`}
          icon="chart"
          iconClass="bg-brand-50 text-brand-600"
        />
      </div>

      <div className="card">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
              placeholder="Search transactions"
            />
          </div>
          <div>
            <label htmlFor="account" className="sr-only">Account</label>
            <select id="account" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="input-field">
              <option value="all">All accounts</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>{accountInfo(a.type).label} {maskAccount(a.accountNumber)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type" className="sr-only">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              <option value="all">All types</option>
              {Object.entries(TRANSACTION_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="range" className="sr-only">Date range</label>
            <select id="range" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input-field">
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description={transactions.length ? 'Try changing your filters or search.' : 'When you send or receive money, it will show up here.'}
          />
        ) : (
          <>
            {/* Table (tablet and up) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => {
                    const d = describeTransaction(t);
                    return (
                      <tr key={t._id} className="transition hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatDate(t.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <IconChip icon={d.icon} className={d.iconClass} size="h-9 w-9" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{t.description}</p>
                              <p className="truncate text-xs text-slate-500">
                                {d.typeLabel}{d.counterparty && ` · ${d.counterparty}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <p className={`text-sm font-semibold tabular-nums ${d.amountClass}`}>{d.amountText}</p>
                          {t.fee > 0 && d.direction === 'out' && (
                            <p className="text-xs text-slate-400">incl. {formatCurrency(t.fee)} fee</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* List (phones) */}
            <ul className="divide-y divide-slate-100 px-4 md:hidden">
              {filtered.map((t) => <TransactionItem key={t._id} transaction={t} />)}
            </ul>

            <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
              Showing {filtered.length} of {transactions.length} transactions
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;

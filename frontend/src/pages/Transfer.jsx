import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';
import { Alert, PageHeader, PageLoader } from '../components/ui';
import { accountInfo, formatCurrency, formatDateTime, maskAccount } from '../utils/format';

const TRANSFER_TYPES = [
  { value: 'internal', label: 'Between my accounts', icon: 'transfer', note: 'Free' },
  { value: 'domestic', label: 'Domestic transfer', icon: 'user', note: '$1.50 fee' },
  { value: 'international', label: 'International', icon: 'globe', note: '3% fee, max $25' },
];

const COUNTRIES = [
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'US', name: 'United States', currency: 'USD' },
];

// Must match calculateFee in backend/routes/transactions.js
const calculateFee = (type, amount) => {
  if (type === 'domestic') return 1.5;
  if (type === 'international') return Math.round(Math.min(amount * 0.03, 25) * 100) / 100;
  return 0;
};

const emptyRecipient = { recipientName: '', recipientBank: '', recipientAccount: '', recipientCountry: 'CA' };

const accountOptionLabel = (a) =>
  `${accountInfo(a.type).label} ${maskAccount(a.accountNumber)} · ${formatCurrency(a.balance, a.currency)}`;

const SummaryRow = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <dt className="text-sm text-slate-500">{label}</dt>
    <dd className={`text-sm tabular-nums ${strong ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{value}</dd>
  </div>
);

const Receipt = ({ receipt, onNew }) => (
  <div className="mx-auto max-w-lg">
    <div className="card overflow-hidden">
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <Icon name="check" className="h-7 w-7" strokeWidth={2.25} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-slate-900">Transfer complete</h1>
        <p className="mt-1 text-sm text-slate-500">{receipt.toLabel}</p>
        <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatCurrency(receipt.amount)}
        </p>
      </div>
      <dl className="divide-y divide-slate-100 border-t border-slate-100 px-6">
        <SummaryRow label="From" value={receipt.fromLabel} />
        <SummaryRow label="To" value={receipt.toLabel} />
        <SummaryRow label="Fee" value={formatCurrency(receipt.fee)} />
        <SummaryRow label="Total taken from account" value={formatCurrency(receipt.total)} strong />
        <SummaryRow label="Reference" value={<span className="font-mono">{receipt.reference}</span>} />
        <SummaryRow label="Date" value={formatDateTime(receipt.date)} />
      </dl>
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row">
        <button type="button" onClick={onNew} className="btn-secondary flex-1">Make another transfer</button>
        <Link to="/transactions" className="btn-primary flex-1">View activity</Link>
      </div>
    </div>
  </div>
);

const Transfer = () => {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transferType, setTransferType] = useState('internal');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    ...emptyRecipient
  });

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      const list = res.data;
      setAccounts(list);
      const wanted = searchParams.get('from');
      setFormData((prev) => {
        if (prev.fromAccount && list.some((a) => a._id === prev.fromAccount)) return prev;
        const from = list.some((a) => a._id === wanted) ? wanted : list[0]?._id || '';
        return { ...prev, fromAccount: from };
      });
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('We couldn’t load your accounts. Please refresh the page.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Changing the source account can make the chosen destination invalid
      ...(name === 'fromAccount' && prev.toAccount === value ? { toAccount: '' } : {})
    }));
  };

  const fromAccount = accounts.find((a) => a._id === formData.fromAccount);
  const toAccount = accounts.find((a) => a._id === formData.toAccount);
  const otherAccounts = accounts.filter((a) => a._id !== formData.fromAccount);
  const amount = parseFloat(formData.amount) || 0;
  const fee = calculateFee(transferType, amount);
  const total = Math.round((amount + fee) * 100) / 100;
  const insufficient = fromAccount && total > fromAccount.balance;
  const country = COUNTRIES.find((c) => c.code === formData.recipientCountry);

  const recipientLabel =
    transferType === 'internal'
      ? (toAccount ? `${accountInfo(toAccount.type).label} ${maskAccount(toAccount.accountNumber)}` : '—')
      : formData.recipientName || '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        fromAccount: formData.fromAccount,
        amount,
        description: formData.description.trim() || 'Money transfer',
        type: transferType === 'internal' ? 'transfer' : transferType === 'domestic' ? 'payment' : 'international'
      };

      if (transferType === 'internal') {
        payload.toAccount = formData.toAccount;
      } else {
        payload.recipient = {
          name: formData.recipientName,
          bankName: formData.recipientBank,
          accountNumber: formData.recipientAccount,
          country: transferType === 'international' ? formData.recipientCountry : 'US',
          currency: transferType === 'international' ? country?.currency : 'USD'
        };
      }

      const res = await axios.post('/api/transactions', payload);
      const t = res.data.transaction;

      setReceipt({
        amount: t.amount,
        fee: t.fee,
        total: Math.round((t.amount + t.fee) * 100) / 100,
        fromLabel: `${accountInfo(fromAccount.type).label} ${maskAccount(fromAccount.accountNumber)}`,
        toLabel: transferType === 'internal' ? recipientLabel : `${formData.recipientName} · ${formData.recipientBank}`,
        reference: String(t._id).slice(-8).toUpperCase(),
        date: t.createdAt
      });

      await fetchAccounts();
      setFormData((prev) => ({ ...prev, toAccount: '', amount: '', description: '', ...emptyRecipient }));
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'The transfer didn’t go through. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <PageLoader />;
  if (receipt) return <Receipt receipt={receipt} onNew={() => setReceipt(null)} />;

  const needsSecondAccount = transferType === 'internal' && otherAccounts.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Send money" description="Move money between your accounts or pay someone else." />

      {/* Transfer type */}
      <div role="radiogroup" aria-label="Transfer type" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TRANSFER_TYPES.map((type) => {
          const selected = transferType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => { setTransferType(type.value); setError(''); }}
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon name={type.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{type.label}</span>
                <span className="block text-xs text-slate-500">{type.note}</span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Details */}
        <div className="card space-y-6 p-6 lg:col-span-3">
          {error && <Alert>{error}</Alert>}

          <div>
            <label htmlFor="fromAccount" className="form-label">From</label>
            <select id="fromAccount" name="fromAccount" value={formData.fromAccount} onChange={handleInputChange} className="input-field" required>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>{accountOptionLabel(a)}</option>
              ))}
            </select>
          </div>

          {transferType === 'internal' ? (
            <div>
              <label htmlFor="toAccount" className="form-label">To</label>
              {needsSecondAccount ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  You need a second account to move money between accounts.{' '}
                  <Link to="/accounts?new=1" className="link">Open one now</Link>
                </div>
              ) : (
                <select id="toAccount" name="toAccount" value={formData.toAccount} onChange={handleInputChange} className="input-field" required>
                  <option value="">Choose an account</option>
                  {otherAccounts.map((a) => (
                    <option key={a._id} value={a._id}>{accountOptionLabel(a)}</option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Recipient</legend>
              <div>
                <label htmlFor="recipientName" className="form-label">Full name</label>
                <input id="recipientName" type="text" name="recipientName" value={formData.recipientName} onChange={handleInputChange} className="input-field" required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="recipientBank" className="form-label">Bank name</label>
                  <input id="recipientBank" type="text" name="recipientBank" value={formData.recipientBank} onChange={handleInputChange} className="input-field" required />
                </div>
                <div>
                  <label htmlFor="recipientAccount" className="form-label">Account number</label>
                  <input id="recipientAccount" type="text" inputMode="numeric" name="recipientAccount" value={formData.recipientAccount} onChange={handleInputChange} className="input-field" required />
                </div>
              </div>
              {transferType === 'international' && (
                <div>
                  <label htmlFor="recipientCountry" className="form-label">Country</label>
                  <select id="recipientCountry" name="recipientCountry" value={formData.recipientCountry} onChange={handleInputChange} className="input-field" required>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                    ))}
                  </select>
                </div>
              )}
            </fieldset>
          )}

          <div>
            <label htmlFor="amount" className="form-label">Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lg font-medium text-slate-400">$</span>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field py-3 pl-9 text-lg font-semibold tabular-nums"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            {fromAccount && (
              <p className={`form-hint ${insufficient ? 'text-rose-600' : ''}`}>
                {insufficient
                  ? `Not enough money. Available: ${formatCurrency(fromAccount.balance)}`
                  : `Available: ${formatCurrency(fromAccount.balance)}`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g. Rent, Gift, Savings"
              maxLength={200}
            />
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-2">
          <div className="card p-6 lg:sticky lg:top-10">
            <h2 className="text-base font-semibold text-slate-900">Summary</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <SummaryRow label="To" value={recipientLabel} />
              <SummaryRow label="Amount" value={formatCurrency(amount)} />
              <SummaryRow label="Fee" value={fee === 0 ? 'Free' : formatCurrency(fee)} />
              {transferType === 'international' && (
                <SummaryRow label="Recipient currency" value={country?.currency} />
              )}
              <SummaryRow label="Total" value={formatCurrency(total)} strong />
              {fromAccount && (
                <SummaryRow
                  label="Balance after"
                  value={<span className={insufficient ? 'text-rose-600' : ''}>{formatCurrency(fromAccount.balance - total)}</span>}
                />
              )}
            </dl>
            <button
              type="submit"
              disabled={submitting || insufficient || amount <= 0 || needsSecondAccount}
              className="btn-primary mt-6 w-full py-3"
            >
              {submitting ? 'Sending…' : `Send ${formatCurrency(amount)}`}
            </button>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Check the details before you send. Transfers can’t be cancelled once they’re complete.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Transfer;

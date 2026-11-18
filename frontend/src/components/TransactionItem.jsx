import { IconChip } from './ui';
import { formatCurrency, formatDate, maskAccount, TRANSACTION_TYPES } from '../utils/format';

// Works out how a transaction should look from the user's point of view.
// netAmount/direction come from the API (see backend/routes/transactions.js).
export const describeTransaction = (t) => {
  const net = t.netAmount ?? 0;
  const direction = t.direction || (net >= 0 ? 'in' : 'out');
  const typeLabel = TRANSACTION_TYPES[t.type] || t.type;

  let counterparty = '';
  if (direction === 'in' && t.fromAccount) counterparty = `From ${maskAccount(t.fromAccount.accountNumber)}`;
  else if (t.toAccount) counterparty = `To ${maskAccount(t.toAccount.accountNumber)}`;
  else if (t.recipient?.name) counterparty = `To ${t.recipient.name}`;

  if (direction === 'internal') {
    return {
      direction,
      icon: 'transfer',
      iconClass: 'bg-brand-50 text-brand-600',
      amountText: formatCurrency(t.amount, t.currency),
      amountClass: 'text-slate-900',
      typeLabel: 'Between your accounts',
      counterparty,
    };
  }

  return {
    direction,
    icon: direction === 'in' ? 'arrowDownLeft' : 'arrowUpRight',
    iconClass: direction === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600',
    amountText: `${direction === 'in' ? '+' : '−'}${formatCurrency(Math.abs(net), t.currency)}`,
    amountClass: direction === 'in' ? 'text-emerald-600' : 'text-slate-900',
    typeLabel,
    counterparty,
  };
};

const TransactionItem = ({ transaction: t }) => {
  const d = describeTransaction(t);
  return (
    <li className="flex items-center gap-4 py-4">
      <IconChip icon={d.icon} className={d.iconClass} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{t.description}</p>
        <p className="truncate text-xs text-slate-500">
          {formatDate(t.createdAt)} · {d.typeLabel}
          {d.counterparty && ` · ${d.counterparty}`}
        </p>
      </div>
      <p className={`whitespace-nowrap text-sm font-semibold tabular-nums ${d.amountClass}`}>{d.amountText}</p>
    </li>
  );
};

export default TransactionItem;

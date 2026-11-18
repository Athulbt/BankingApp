const currencyFormatters = {};

export const formatCurrency = (value, currency = 'USD') => {
  if (!currencyFormatters[currency]) {
    try {
      currencyFormatters[currency] = new Intl.NumberFormat('en-US', { style: 'currency', currency });
    } catch {
      currencyFormatters[currency] = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }
  }
  return currencyFormatters[currency].format(Number(value) || 0);
};

export const maskAccount = (accountNumber) =>
  `•••• ${accountNumber ? String(accountNumber).slice(-4) : '0000'}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export const ACCOUNT_TYPES = {
  checking: {
    label: 'Checking',
    description: 'For everyday spending, bills and transfers.',
    icon: 'card',
    gradient: 'from-navy-900 via-navy-800 to-brand-700',
    chip: 'bg-brand-50 text-brand-600',
  },
  savings: {
    label: 'Savings',
    description: 'Set money aside and earn interest on your balance.',
    icon: 'percent',
    gradient: 'from-emerald-950 via-emerald-900 to-emerald-600',
    chip: 'bg-emerald-50 text-emerald-600',
  },
  business: {
    label: 'Business',
    description: 'Keep your business finances separate.',
    icon: 'briefcase',
    gradient: 'from-slate-950 via-slate-800 to-slate-600',
    chip: 'bg-slate-100 text-slate-700',
  },
  investment: {
    label: 'Investment',
    description: 'Grow your money for the long term.',
    icon: 'chart',
    gradient: 'from-violet-950 via-violet-900 to-violet-600',
    chip: 'bg-violet-50 text-violet-600',
  },
};

export const accountInfo = (type) =>
  ACCOUNT_TYPES[type] || {
    label: type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Account',
    description: '',
    icon: 'card',
    gradient: 'from-navy-900 to-brand-700',
    chip: 'bg-slate-100 text-slate-700',
  };

export const accountLabel = (type) => `${accountInfo(type).label} account`;

export const TRANSACTION_TYPES = {
  transfer: 'Transfer',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  payment: 'Domestic transfer',
  international: 'International transfer',
};

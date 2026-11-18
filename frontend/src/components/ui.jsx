import Icon from './Icon';

export const Spinner = ({ className = 'h-6 w-6' }) => (
  <svg className={`animate-spin text-brand-600 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const PageLoader = () => (
  <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
    <Spinner className="h-8 w-8" />
  </div>
);

export const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </div>
);

const alertTones = {
  error: { box: 'border-rose-200 bg-rose-50 text-rose-800', icon: 'alert', iconColor: 'text-rose-500' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: 'checkCircle', iconColor: 'text-emerald-500' },
  info: { box: 'border-brand-200 bg-brand-50 text-brand-800', icon: 'alert', iconColor: 'text-brand-500' },
};

export const Alert = ({ tone = 'error', children, className = '' }) => {
  const t = alertTones[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${t.box} ${className}`}>
      <Icon name={t.icon} className={`mt-0.5 h-4 w-4 shrink-0 ${t.iconColor}`} />
      <div>{children}</div>
    </div>
  );
};

const badgeTones = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
};

export const Badge = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${badgeTones[tone]}`}>
    {children}
  </span>
);

const statusTone = { completed: 'success', pending: 'warning', failed: 'danger', cancelled: 'neutral' };
export const StatusBadge = ({ status }) => <Badge tone={statusTone[status] || 'neutral'}>{status}</Badge>;

export const IconChip = ({ icon, className = 'bg-brand-50 text-brand-600', size = 'h-10 w-10' }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full ${size} ${className}`}>
    <Icon name={icon} className="h-5 w-5" />
  </span>
);

export const StatCard = ({ label, value, hint, icon, iconClass }) => (
  <div className="card flex items-start justify-between gap-4 p-5">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
    {icon && <IconChip icon={icon} className={iconClass} />}
  </div>
);

export const EmptyState = ({ icon = 'receipt', title, description, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <IconChip icon={icon} className="bg-slate-100 text-slate-500" size="h-12 w-12" />
    <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    {action}
  </div>
);

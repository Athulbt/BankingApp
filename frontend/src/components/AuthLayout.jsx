import Logo from './Logo';
import Icon from './Icon';

const points = [
  { icon: 'shield', text: 'Encrypted passwords and expiring sign-in sessions' },
  { icon: 'bolt', text: 'Instant transfers between your accounts' },
  { icon: 'chart', text: 'A clear view of every dollar in and out' },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen bg-white">
    {/* Brand panel (desktop only) */}
    <div className="relative hidden w-[44%] overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-500/10" aria-hidden="true" />

      <Logo variant="dark" className="relative" />

      <div className="relative">
        <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
          Your money, organized and within reach.
        </h2>
        <ul className="mt-8 space-y-4">
          {points.map((p) => (
            <li key={p.text} className="flex items-center gap-3 text-slate-300">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              {p.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-slate-500">A demo project. Not a real bank.</p>
    </div>

    {/* Form */}
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-16">
      <div className="mx-auto w-full max-w-sm">
        <Logo className="mb-10 lg:hidden" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-8 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  </div>
);

export default AuthLayout;

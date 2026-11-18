import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo, { LogoMark } from '../components/Logo';
import Icon from '../components/Icon';

const features = [
  {
    icon: 'shield',
    title: 'Secure by design',
    text: 'Passwords are hashed, and every session uses a signed token that expires.',
  },
  {
    icon: 'bolt',
    title: 'Instant transfers',
    text: 'Move money between your own accounts in seconds, any time of day.',
  },
  {
    icon: 'globe',
    title: 'Send money abroad',
    text: 'Pay people overseas with fees shown upfront before you confirm.',
  },
  {
    icon: 'chart',
    title: 'See where it goes',
    text: 'Track money in and out with searchable history and CSV export.',
  },
];

const HeroVisual = () => (
  <div className="relative mx-auto w-full max-w-md lg:mx-0">
    <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/60 via-white to-emerald-100/60 blur-2xl" aria-hidden="true" />

    {/* Card */}
    <div className="relative aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 p-6 text-white shadow-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-sm font-semibold">Banking App</span>
          </div>
          <span className="text-xs font-medium uppercase tracking-widest text-white/60">Debit</span>
        </div>
        <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" aria-hidden="true" />
        <div>
          <p className="font-mono text-lg tracking-[0.2em] text-white/90 sm:text-xl">•••• •••• •••• 4821</p>
          <div className="mt-3 flex justify-between text-xs uppercase tracking-wider text-white/60">
            <span>Alex Morgan</span>
            <span>09/29</span>
          </div>
        </div>
      </div>
    </div>

    {/* Floating balance panel */}
    <div className="relative -mt-8 ml-auto w-64 rounded-xl bg-white p-4 shadow-lift ring-1 ring-slate-900/5 sm:-mr-6">
      <p className="text-xs font-medium text-slate-500">Total balance</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">$12,480.50</p>
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="arrowDownLeft" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Salary</p>
          <p className="text-xs text-slate-500">Today</p>
        </div>
        <p className="text-sm font-semibold text-emerald-600 tabular-nums">+$3,200.00</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Sign in</Link>
                <Link to="/register" className="btn-primary hidden sm:inline-flex">Open an account</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-slate-50 to-white" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Online banking, simplified
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Banking that keeps up with your life.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Open checking and savings accounts, send money at home or abroad, and see every
              transaction in one clear place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link to="/dashboard" className="btn-primary btn-lg">
                  Go to dashboard
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary btn-lg">
                    Open an account
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                  <Link to="/login" className="btn-secondary btn-lg">Sign in</Link>
                </>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              {['No monthly fees', 'Free transfers between accounts', 'Open in minutes'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Icon name="checkCircle" className="h-4 w-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Why Banking App</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Everything you need to manage your money
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      {!user && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-12 sm:px-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/20" aria-hidden="true" />
              <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Open your account in minutes
                  </h2>
                  <p className="mt-2 text-slate-300">Your checking account is ready as soon as you sign up.</p>
                </div>
                <Link to="/register" className="btn btn-lg bg-white text-navy-900 hover:bg-slate-100">
                  Get started
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Banking App</p>
          <p>A demo project. Not a real bank, and no real money is involved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

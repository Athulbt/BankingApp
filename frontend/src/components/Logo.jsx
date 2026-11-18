import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" className="fill-brand-600" />
    <path
      d="M11 8h6a4 4 0 0 1 0 8h-6zM11 16h7a4 4 0 0 1 0 8h-7z"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

// variant="dark" for dark backgrounds (white text)
const Logo = ({ to = '/', variant = 'light', className = '' }) => (
  <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark />
    <span className={`whitespace-nowrap text-lg font-semibold tracking-tight ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      Banking App
    </span>
  </Link>
);

export default Logo;

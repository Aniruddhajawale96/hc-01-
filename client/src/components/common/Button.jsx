import clsx from 'clsx';
// import { LucideIcon } from 'lucide-react'; // For icons


const variantStyles = {
  primary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25',
  secondary: 'bg-white/80 hover:bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
  outline: 'bg-white/50 hover:bg-white border-2 border-white/50 text-white backdrop-blur-sm',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/10',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg font-semibold',
};

export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', loading = false, disabled = false, onClick, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none glass-card backdrop-blur-sm',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner size="sm" />}
{Icon && <Icon className="w-4 h-4" />}


      {children}
    </button>
  );
}


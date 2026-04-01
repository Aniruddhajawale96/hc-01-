import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

export default function Input({ label, icon: Icon, className = '', error, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          className={clsx(
            'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white/80 backdrop-blur-sm text-slate-900 font-medium shadow-sm transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:shadow-lg hover:border-slate-300 hover:shadow-md',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}


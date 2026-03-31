import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Reception from './pages/Reception';
import Doctor from './pages/Doctor';
import Display from './pages/Display';
import Emergency from './pages/Emergency';

const navItems = [
  { path: '/reception', label: 'Reception', icon: '🎫', desc: 'Register patients' },
  { path: '/doctor', label: 'Doctor', icon: '🩺', desc: 'Manage queue' },
  { path: '/display', label: 'Display', icon: '📺', desc: 'TV board' },
  { path: '/emergency', label: 'Emergency', icon: '🚨', desc: 'AI redirect' },
];

function App() {
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const isDisplayPage = location.pathname === '/display';

  // Display page = fullscreen, no nav
  if (isDisplayPage) {
    return (
      <Routes>
        <Route path="/display" element={<Display />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl">🏥</span>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight group-hover:text-sky-700 transition-colors">
                  Hospital Queue
                </h1>
                <p className="text-[10px] text-slate-400 font-medium -mt-0.5">OPD Management System</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    location.pathname === item.path
                      ? item.path === '/emergency'
                        ? 'bg-red-100 text-red-700 shadow-sm'
                        : 'bg-sky-100 text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenu
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="md:hidden pb-4 animate-slide-up">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                    location.pathname === item.path
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/reception" />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/display" element={<Display />} />
            <Route path="/emergency" element={<Emergency />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;

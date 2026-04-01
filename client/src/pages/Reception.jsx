import { useState } from 'react';
import { useQueue } from '../context/QueueContext';

import StatsCard from '../components/StatsCard';
import QueueList from '../components/QueueList';

export default function Reception() {
  const { queue, createToken, stats, loading, connected } = useQueue();
  const [form, setForm] = useState({ patientName: '', age: '', condition: '', priority: 'general' });
  const [lastToken, setLastToken] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.patientName.trim()) {
      setError('Patient name is required');
      return;
    }

    try {
      const token = await createToken({
        patientName: form.patientName.trim(),
        age: form.age ? Number(form.age) : undefined,
        condition: form.condition.trim(),
        priority: form.priority,
      });
      setLastToken(token);
      setForm({ patientName: '', age: '', condition: '', priority: 'general' });
    } catch (err) {
      setError(err.message || 'Failed to create token');
    }
  };

  const waitingQueue = queue.filter(t => t.status === 'waiting');
  const tokenStr = lastToken ? `A${(lastToken.tokenNumber || 0).toString().padStart(3, '0')}` : '---';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Reception Panel</h2>
          <p className="text-slate-500 mt-1">Register patients and issue queue tokens</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Token Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎫</span> Register New Patient
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter full name"
                    value={form.patientName}
                    onChange={e => setForm({ ...form, patientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Age"
                    min="0"
                    max="150"
                    value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Condition / Symptoms</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Brief description (e.g., fever, headache, chest pain)"
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                />
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'general', label: '🏥 General', color: 'sky', desc: 'Standard queue' },
                    { value: 'senior', label: '👴 Senior', color: 'amber', desc: 'Priority for elderly' },
                    { value: 'emergency', label: '🚨 Emergency', color: 'red', desc: 'Immediate attention' },
                  ].map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                        form.priority === p.value
                          ? p.color === 'red' ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100'
                          : p.color === 'amber' ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                          : 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{p.label.split(' ')[0]}</span>
                      <span className="text-sm font-bold block">{p.label.split(' ').slice(1).join(' ')}</span>
                      <span className="text-xs text-slate-400 block mt-1">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 text-lg font-bold rounded-xl transition-all duration-300 ${
                  form.priority === 'emergency'
                    ? 'btn-danger animate-emergency'
                    : 'btn-primary'
                }`}
              >
                {loading ? '⏳ Generating...' : `Generate Token ${form.priority === 'emergency' ? '🚨' : '🎫'}`}
              </button>
            </form>

            {/* Last Token Generated */}
            {lastToken && (
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 text-center animate-slide-up">
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Token Generated</p>
                <p className="text-5xl font-black text-emerald-700 my-3">{tokenStr}</p>
                <p className="text-sm text-emerald-600">{lastToken.patientName} • {lastToken.priority}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats + Queue */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard icon="⏳" label="Waiting" value={stats?.waiting || waitingQueue.length} color="sky" />
            <StatsCard icon="✅" label="Completed" value={stats?.completed || 0} color="emerald" />
            <StatsCard icon="🚨" label="Emergency" value={stats?.emergencies || 0} color="red" />
            <StatsCard icon="📊" label="Total Today" value={stats?.totalTokens || queue.length} color="purple" />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Current Queue</h3>
            <QueueList queue={waitingQueue.slice(0, 8)} />
          </div>
        </div>
      </div>
    </div>
  );
}

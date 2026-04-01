import useQueue from '../hooks/useQueue';
import QueueList from '../components/QueueList';
import { useEffect, useState } from 'react';

export default function Display() {
  const { queue, currentToken, stats, connected } = useQueue();
  const waitingQueue = queue.filter(t => t.status === 'waiting');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const currentStr = currentToken
    ? `A${currentToken.tokenNumber.toString().padStart(3, '0')}`
    : '---';

  const nextTokens = waitingQueue.slice(0, 6);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <h1 className="text-xl font-bold tracking-wide">HOSPITAL OPD QUEUE</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm text-white/70">{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono font-bold">{time.toLocaleTimeString()}</p>
            <p className="text-xs text-white/50">{time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* NOW SERVING — Large Display */}
          <div className="lg:col-span-5">
            <div className={`glass-card-dark p-12 text-center h-full flex flex-col justify-center ${currentToken?.isEmergency ? 'animate-emergency border-red-500/50' : 'animate-glow border-emerald-500/30'} border-2`}>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50 mb-6">Now Serving</p>
              <div className={`text-[8rem] md:text-[10rem] lg:text-[12rem] font-black leading-none ${currentToken?.isEmergency ? 'text-red-400' : 'text-emerald-400'}`}>
                {currentStr}
              </div>
              {currentToken && (
                <div className="mt-6 space-y-2">
                  <p className="text-xl text-white/80 font-semibold">{currentToken.patientName}</p>
                  <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold ${
                    currentToken.priority === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    currentToken.priority === 'senior' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}>
                    {currentToken.priority === 'emergency' ? '🚨 EMERGENCY' : currentToken.priority === 'senior' ? '👴 Senior' : '🏥 General'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Next Up + Stats */}
          <div className="lg:col-span-7 space-y-8">
            {/* Next Tokens Grid */}
            <div>
              <h2 className="text-lg font-bold text-white/60 uppercase tracking-wider mb-4">Next Up</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {nextTokens.length > 0 ? nextTokens.map((token, index) => (
                  <div
                    key={token._id}
                    className={`glass-card-dark p-6 text-center transition-all duration-500 hover:scale-105 animate-slide-up ${
                      token.isEmergency ? 'border-red-500/30 animate-emergency' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`text-3xl md:text-4xl font-black mb-2 ${
                      token.priority === 'emergency' ? 'text-red-400' :
                      token.priority === 'senior' ? 'text-amber-400' : 'text-white/90'
                    }`}>
                      A{token.tokenNumber.toString().padStart(3, '0')}
                    </div>
                    <p className="text-sm text-white/50 truncate">{token.patientName}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        token.priority === 'emergency' ? 'bg-red-500 animate-pulse' :
                        token.priority === 'senior' ? 'bg-amber-500' : 'bg-sky-500'
                      }`} />
                      <span className="text-xs text-white/40 capitalize">{token.priority}</span>
                    </div>
                    {token.estimatedWaitTime > 0 && (
                      <p className="text-xs text-white/30 mt-1">~{Math.round(token.estimatedWaitTime)} min</p>
                    )}
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-white/30">
                    <span className="text-4xl block mb-2">📋</span>
                    <p className="text-lg">No patients waiting</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Waiting', value: waitingQueue.length, color: 'from-sky-500/20 to-blue-500/20 border-sky-500/20' },
                { label: 'Completed', value: stats?.completed || 0, color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/20' },
                { label: 'Avg Wait', value: `${stats?.avgConsultTime || 10}m`, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20' },
                { label: 'Total', value: stats?.totalTokens || queue.length, color: 'from-purple-500/20 to-violet-500/20 border-purple-500/20' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-xl p-4 text-center`}>
                  <p className="text-2xl font-black text-white/90">{s.value}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Full Queue */}
            <div className="glass-card-dark p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white/70">Full Queue ({waitingQueue.length})</h3>
                <span className="text-xs text-white/30">Auto-refreshing via WebSocket</span>
              </div>
              <QueueList queue={waitingQueue} displayMode />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

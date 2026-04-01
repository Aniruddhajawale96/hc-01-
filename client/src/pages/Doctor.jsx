import { useState, useEffect, useCallback } from 'react';
import { useQueue } from '../context/QueueContext';

import QueueList from '../components/QueueList';
import ConsultationTimer from '../components/ConsultationTimer';
import StatsCard from '../components/StatsCard';
import * as api from '../services/api';

export default function Doctor() {
  const { queue, callNext, completeToken, currentToken, stats, loading, connected } = useQueue();
  const [session, setSession] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [error, setError] = useState('');

  const waitingQueue = queue.filter(t => t.status === 'waiting');

// Fetch active session - now updates after token completion too
  const refetchSession = useCallback(async () => {
    try {
      const res = await api.getDoctorSession();
      const data = res.data || res;
      setSession(data);
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  }, []);

  useEffect(() => {
    refetchSession();
  }, []);

  const handleStartSession = async () => {
    if (!doctorName.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      const res = await api.startDoctorSession({ doctorName: doctorName.trim() });
      setSession(res.data || res);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEndSession = async () => {
    try {
      await api.endDoctorSession();
      setSession(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCallNext = async () => {
    setError('');
    try {
      await callNext();
    } catch (err) {
      setError(err.message || 'No patients waiting');
    }
  };

  // Updated handleComplete with session refresh
  const handleComplete = async () => {
    if (!currentToken) return;
    setError('');
    try {
      await completeToken(currentToken.tokenNumber);
      await refetchSession(); // Refresh session to show updated tokensHandled count
    } catch (err) {
      setError(err.message);
    }
  };

  // If no session, show session start screen
  if (!session) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="glass-card p-10 text-center">
          <span className="text-6xl block mb-4">👨‍⚕️</span>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Doctor Panel</h2>
          <p className="text-slate-500 mb-8">Start your session to manage the queue</p>

          <div className="space-y-4">
            <input
              type="text"
              className="input-field text-center"
              placeholder="Enter your name"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartSession()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleStartSession} className="w-full btn-primary text-lg py-4">
              🩺 Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTokenStr = currentToken
    ? `A${currentToken.tokenNumber.toString().padStart(3, '0')}`
    : '---';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Doctor Panel</h2>
          <p className="text-slate-500 mt-1">Dr. {session.doctorName} • Session Active</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
          <button onClick={handleEndSession} className="btn-outline text-sm py-2 px-4">
            End Session
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="⏳" label="Waiting" value={waitingQueue.length} color="sky" />
        <StatsCard icon="🩺" label="In Progress" value={currentToken ? 1 : 0} color="emerald" />
        <StatsCard icon="✅" label="Handled" value={session.tokensHandled || 0} color="purple" />
        <StatsCard icon="⏱️" label="Avg Time" value={`${stats?.avgConsultTime || 10}m`} color="amber" />
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slide-up">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Current Patient + Timer */}
        <div className="space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Now Serving</h3>
            <div className="text-center my-6">
              <div className={`inline-block token-display ${currentToken ? 'text-emerald-600' : 'text-slate-300'}`}>
                {currentTokenStr}
              </div>
              {currentToken && (
                <div className="mt-3">
                  <p className="text-lg font-semibold text-slate-700">{currentToken.patientName}</p>
                  <span className={currentToken.priority === 'emergency' ? 'badge-emergency' : currentToken.priority === 'senior' ? 'badge-senior' : 'badge-general'}>
                    {currentToken.priority}
                  </span>
                  {currentToken.condition && (
                    <p className="text-sm text-slate-500 mt-2">{currentToken.condition}</p>
                  )}
                </div>
              )}
            </div>

            <ConsultationTimer
              isActive={!!currentToken}
              startTime={currentToken?.calledAt}
              onComplete={currentToken ? handleComplete : undefined}
            />
          </div>

          {/* Call Next Button */}
          <button
            onClick={handleCallNext}
            disabled={loading || waitingQueue.length === 0}
            className="w-full btn-primary text-xl py-6 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Calling...' : waitingQueue.length === 0 ? '📋 No Patients Waiting' : `📢 Call Next Patient (${waitingQueue.length} waiting)`}
          </button>
        </div>

        {/* Right: Queue */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Waiting Queue ({waitingQueue.length})</h3>
            <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">
              Priority Sorted
            </span>
          </div>
          <QueueList
            queue={waitingQueue}
            isDoctorView={false}
          />
        </div>
      </div>
    </div>
  );
}

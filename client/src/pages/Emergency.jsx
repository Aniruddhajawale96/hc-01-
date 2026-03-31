import { useState } from 'react';
import * as api from '../services/api';

export default function Emergency() {
  const [form, setForm] = useState({ patientName: '', condition: '', lat: '', lng: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setSelectedHospital(null);

    if (!form.patientName.trim() || !form.condition.trim()) {
      setError('Patient name and condition are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.getEmergencyRedirect({
        patientName: form.patientName.trim(),
        condition: form.condition.trim(),
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      });
      setResults(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);
    if (results?.caseId) {
      try {
        await api.selectHospital({
          caseId: results.caseId,
          hospitalName: hospital.name,
          hospitalDistance: hospital.distance,
          hospitalAddress: hospital.address,
        });
      } catch (err) {
        console.error('Failed to log selection:', err);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="text-4xl">🚨</span> Emergency Smart Redirect
        </h2>
        <p className="text-slate-500 mt-1">AI-powered hospital recommendation based on patient condition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Patient Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Full name"
                  value={form.patientName}
                  onChange={e => setForm({ ...form, patientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Condition *</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="Describe condition (e.g., severe chest pain, head trauma, fracture...)"
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field text-sm"
                    placeholder="28.6139"
                    value={form.lat}
                    onChange={e => setForm({ ...form, lat: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field text-sm"
                    placeholder="77.2090"
                    value={form.lng}
                    onChange={e => setForm({ ...form, lng: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>
              )}

              <button type="submit" disabled={loading} className="w-full btn-danger py-4 text-lg font-bold">
                {loading ? '🔍 Analyzing...' : '🏥 Find Best Hospital'}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!results && !loading && (
            <div className="text-center py-20 text-slate-400">
              <span className="text-6xl block mb-4">🏥</span>
              <p className="text-xl font-semibold">Enter patient details to get AI recommendations</p>
              <p className="text-sm mt-2">The system analyzes distance, availability, and specialization</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">AI is analyzing hospitals...</p>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-slide-up">
              {/* Detected Specialization */}
              <div className="glass-card p-4 flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-sm text-slate-500">AI Detected Specialization</p>
                  <p className="text-lg font-bold text-slate-800 capitalize">{results.detectedSpecialization}</p>
                </div>
              </div>

              {/* Best Recommendation */}
              {results.bestHospital && (
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedHospital?.name === results.bestHospital.name
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                    : 'border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded-full">⭐ TOP RECOMMENDATION</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{results.bestHospital.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{results.bestHospital.address}</p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-2 bg-white rounded-xl">
                      <p className="text-lg font-bold text-slate-800">{results.bestHospital.distance} km</p>
                      <p className="text-xs text-slate-500">Distance</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-xl">
                      <p className="text-lg font-bold text-emerald-600">{results.bestHospital.availability}%</p>
                      <p className="text-xs text-slate-500">Availability</p>
                    </div>
                    <div className={`text-center p-2 rounded-xl border ${getScoreColor(results.bestHospital.score)}`}>
                      <p className="text-lg font-bold">{results.bestHospital.score}</p>
                      <p className="text-xs">AI Score</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <a href={`tel:${results.bestHospital.phone}`} className="btn-primary flex-1 text-center text-sm py-2">
                      📞 {results.bestHospital.phone}
                    </a>
                    <button
                      onClick={() => handleSelectHospital(results.bestHospital)}
                      className="btn-success flex-1 text-sm py-2"
                    >
                      ✓ Select This Hospital
                    </button>
                  </div>
                </div>
              )}

              {/* All Suggestions */}
              <div>
                <h4 className="text-lg font-bold text-slate-700 mb-3">All Recommendations</h4>
                <div className="space-y-3">
                  {results.allSuggestions?.map((h, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        selectedHospital?.name === h.name
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-sky-300'
                      }`}
                      onClick={() => handleSelectHospital(h)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                          <div>
                            <p className="font-bold text-slate-800">{h.name}</p>
                            <p className="text-xs text-slate-500">{h.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">{h.distance} km</span>
                          <span className={`font-bold ${h.availability >= 70 ? 'text-emerald-600' : h.availability >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            {h.availability}%
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(h.score)}`}>
                            {h.score}
                          </span>
                          {h.hasSpecialization && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">✓ Specialist</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedHospital && (
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-center animate-slide-up">
                  <p className="text-emerald-800 font-bold">✅ Redirecting to: {selectedHospital.name}</p>
                  <p className="text-emerald-600 text-sm">{selectedHospital.distance} km away • {selectedHospital.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

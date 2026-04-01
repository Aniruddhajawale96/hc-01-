import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { useQueue } from '../context/QueueContext';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { formatDate } from '../utils/format';

export default function Home() {
  const { stats, refetch: refetchQueue, loading } = useQueue();
  const [seeding, setSeeding] = useState('');

  const handleSeed = async (type) => {
    setSeeding(type);
    toast.loading('Seeding demo data...', { id: 'seed' });
    try {
      await api.post('/seed', { type }); // Assume backend /api/seed
      toast.success('Demo data seeded! Check panels.', { id: 'seed' });
      refetchQueue();
    } catch (error) {
      toast.error('Seed failed - backend may need /seed endpoint', { id: 'seed' });
    }
    setSeeding('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/70 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-sm mb-6">
            <span className="text-3xl">🏥</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 to-sky-900 bg-clip-text text-transparent">
                Hospital OPD Queue System
              </h1>
              <p className="text-xl text-slate-600 mt-2">Digital token management with real-time sync</p>
            </div>
          </div>
          <Badge priority="emergency">Ready • Backend @ :5000 • Frontend @ :5173</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card elevated className="group hover:-translate-y-2 transition-all duration-500">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🎫</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Reception</h2>
            <p className="text-slate-600 mb-8">Issue tokens, manage priorities, view live queue & stats</p>
            <Link to="/reception" className="w-full">
              <Button size="lg" className="w-full">Go to Reception</Button>
            </Link>
          </Card>

          <Card elevated className="group hover:-translate-y-2 transition-all duration-500">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">🩺</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Doctor</h2>
            <p className="text-slate-600 mb-8">Call next, timers, skip/recall, session management</p>
            <Link to="/doctor" className="w-full">
              <Button size="lg" className="w-full">Go to Doctor</Button>
            </Link>
          </Card>

          <Card elevated className="group hover:-translate-y-2 transition-all duration-500">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">📺</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Display</h2>
            <p className="text-slate-600 mb-8">Fullscreen TV board, alerts, audio, animations</p>
            <Link to="/display" className="w-full">
              <Button size="lg" className="w-full">Open Display</Button>
            </Link>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-6">Quick Demo Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => handleSeed('general')}
              disabled={loading || seeding === 'general'}
              icon="📋"
            >
              {seeding === 'general' ? <Spinner /> : 'Seed General Queue'}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => handleSeed('senior')}
              disabled={loading || seeding === 'senior'}
              icon="👴"
            >
              {seeding === 'senior' ? <Spinner /> : 'Seed Seniors'}
            </Button>
            <Button 
              variant="danger" 
              size="lg" 
              onClick={() => handleSeed('emergency')}
              disabled={loading || seeding === 'emergency'}
              icon="🚨"
            >
              {seeding === 'emergency' ? <Spinner /> : 'Add Emergency'}
            </Button>
          </div>
          {stats && (
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-4">Current Stats</h4>
              <p className="text-sm text-slate-600">Total today: {stats.totalTokens || 0} • Waiting: {stats.waiting || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Updated {formatDate(Date.now())}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


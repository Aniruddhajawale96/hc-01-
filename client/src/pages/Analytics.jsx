import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueueStore } from '../store/useQueueStore';
import { MetricCard } from '../components/shared/MetricCard';
import { StatusPill } from '../components/shared/StatusPill';
import { getStatusColors } from '../components/shared/TokenBadge';
import { Users, Clock, Activity, ListChecks, ArrowDown, ArrowUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const Analytics = () => {
  const store = useQueueStore();
  const tokens = store.tokens;
  const stats = store.getStats();
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });

  // Generate Mock Chart Data from Tokens
  const chartData = useMemo(() => {
    // Flow across hours 8AM to 6PM
    const base = [8,9,10,11,12,13,14,15,16,17,18].map(h => ({ time: `${h}:00`, patients: Math.floor(Math.random() * 5) }));
    // Try to layer actual data if present
    tokens.forEach(t => {
      const h = new Date(t.createdAt).getHours();
      const match = base.find(b => b.time === `${h}:00`);
      if (match) match.patients += 1;
    });
    return base;
  }, [tokens]);

  const pieData = useMemo(() => {
    const counts = { waiting: 0, checked_in: 0, in_service: 0, completed: 0, emergency: 0 };
    tokens.forEach(t => {
      counts[t.priority === 'emergency' && t.status !== 'completed' ? 'emergency' : t.status] += 1;
    });
    return [
      { name: 'Waiting', value: counts.waiting, color: '#D4A373' },
      { name: 'Checked In', value: counts.checked_in, color: '#4A5D4E' },
      { name: 'Serving', value: counts.in_service, color: '#9BA993' },
      { name: 'Completed', value: counts.completed, color: '#9D8189' },
      { name: 'Emergency', value: counts.emergency, color: '#C0857E' },
    ].filter(d => d.value > 0);
  }, [tokens]);

  // History Table sorting
  const sortedTokens = useMemo(() => {
    return [...tokens].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      if (sortConfig.key === 'duration') {
         valA = a.duration || 0;
         valB = b.duration || 0;
      }
      if (sortConfig.key === 'createdAt') {
         valA = new Date(valA).getTime();
         valB = new Date(valB).getTime();
      }
      
      if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tokens, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <span className="w-4 h-4 inline-block opacity-0" />;
    return sortConfig.dir === 'asc' ? <ArrowUp size={14} className="inline ml-1 text-accent" /> : <ArrowDown size={14} className="inline ml-1 text-accent" />;
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Live Analytics</h1>
          <p className="text-text-muted mt-1">Operational metrics and historical token data</p>
        </div>
      </div>

      {/* ROW 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Served Today" value={stats.served} trend="up" color="purple" Icon={Users} />
        <MetricCard label="Avg Consult" value={stats.avgConsultTime} trend="down" color="green" Icon={Clock} />
        <MetricCard label="Avg Wait" value={stats.estWaitTime} color="amber" Icon={Clock} />
        <MetricCard label="Active Tokens" value={stats.activeTokens} color="cyan" Icon={Activity} />
      </div>

      {/* ROW 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-card border border-border rounded-[24px] p-6 shadow-level-1 h-[360px] flex flex-col">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6">Hourly Patient Flow</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A5D4E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4A5D4E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#BCAE9B" vertical={false} />
                <XAxis dataKey="time" stroke="#5C6B5E" tick={{ fill: '#5C6B5E', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#5C6B5E" tick={{ fill: '#5C6B5E', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#FAFAF7', border: '1px solid #BCAE9B', borderRadius: '12px', color: '#28332A' }}
                  itemStyle={{ color: '#4A5D4E', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="patients" stroke="#4A5D4E" strokeWidth={3} fillOpacity={1} fill="url(#colorFlow)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[24px] p-6 shadow-level-1 h-[360px] flex flex-col">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6 flex justify-between">
            Status Distribution
            <span className="text-text bg-surface px-3 py-1 rounded-full">{tokens.length} Total</span>
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#FAFAF7', border: '1px solid #BCAE9B', borderRadius: '12px', color: '#28332A', padding: '8px 12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ color: '#28332A', fontSize: '13px', paddingLeft: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 3: History Table */}
      <div className="bg-card border border-border rounded-[24px] shadow-level-1 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <ListChecks size={18} /> Token Log History
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['tokenNumber', 'patientName', 'patientId', 'status', 'duration', 'createdAt'].map(col => {
                  const label = col === 'createdAt' ? 'Time' : col.replace('patient', '');
                  return (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)}
                      className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-accent transition-colors whitespace-nowrap"
                    >
                      {label} <SortIcon col={col} />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedTokens.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-text-muted italic">No records present in the active queue</td></tr>
              ) : (
                sortedTokens.map((t, idx) => {
                  const isBgRow = idx % 2 === 0;
                  const durationSpan = t.duration 
                    ? <span className={`font-mono font-bold ${t.duration > stats.avgConsultTime ? 'text-red' : 'text-green'}`}>{t.duration}m</span>
                    : <span className="text-text-dim">—</span>;
                  const timeSpan = new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <motion.tr 
                      key={t._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'var(--card-hover)', transition: { duration: 0.2 } }}
                      className={`border-b border-border/50 last:border-0 ${isBgRow ? 'bg-transparent' : 'bg-surface/30'}`}
                    >
                      <td className="p-4 border-l-[3px] font-bold font-mono" style={{ borderColor: getStatusColors(t.status).raw }}>#{t.tokenNumber}</td>
                      <td className="p-4 font-bold text-text whitespace-nowrap">{t.patientName}</td>
                      <td className="p-4 font-mono text-text-muted text-sm">{t.patientId}</td>
                      <td className="p-4"><StatusPill status={t.status} /></td>
                      <td className="p-4 text-sm">{durationSpan}</td>
                      <td className="p-4 font-mono text-text-muted text-sm">{timeSpan}</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

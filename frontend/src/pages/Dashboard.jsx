import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiShieldCheck, HiExclamationTriangle, HiChartBar, HiClock,
  HiBolt, HiHome, HiArrowPath, HiGlobeAlt, HiMoon, HiSignal,
} from 'react-icons/hi2';
import { getDailyInsights, getWeeklyTrends, triggerRetrain } from '../services/api';
import Background3D from '../components/Background3D';

const NEON = ['#6366f1', '#a855f7', '#06d6a0', '#38bdf8', '#f59e0b', '#ec4899', '#ef4444'];

function MetricCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="glass rounded-2xl p-6 group hover:glow-border transition-all duration-500 holographic"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
          style={{ boxShadow: `0 0 15px ${NEON[Math.floor(Math.random() * NEON.length)]}30` }}>
          <Icon className="text-white text-lg" />
        </div>
        <span className="text-xs font-display font-bold text-slate-600 tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-display font-black text-white group-hover:animate-pulse-glow">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1 font-mono">{sub}</p>}
    </motion.div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <p className="text-slate-500 text-center font-display py-8">No weekly data</p>;
  const maxTx = Math.max(...data.map(d => d.total_transactions || 1), 1);
  return (
    <div className="flex items-end gap-2 justify-around h-48 px-4">
      {data.map((day, i) => {
        const h = Math.max(((day.total_transactions || 0) / maxTx) * 100, 4);
        const fraudPct = day.fraud_percentage || 0;
        const barColor = fraudPct > 40 ? 'from-red-500 to-rose-600' : fraudPct > 15 ? 'from-yellow-500 to-orange-500' : 'from-indigo-500 to-violet-500';
        const neon = fraudPct > 40 ? '#ef4444' : fraudPct > 15 ? '#f59e0b' : '#6366f1';
        return (
          <motion.div key={i} className="flex flex-col items-center gap-2 flex-1"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: i * 0.08, duration: 0.5 }}>
            <div className="relative group cursor-pointer w-full flex justify-center">
              <motion.div className={`bg-gradient-to-t ${barColor} rounded-t-lg w-full max-w-[36px]`}
                initial={{ height: 0 }} animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
                style={{ minHeight: '16px', height: `${h}px`, boxShadow: `0 0 10px ${neon}30` }}
                whileHover={{ scaleX: 1.15, y: -4 }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-2 py-1 text-xs text-white font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                {day.total_transactions} tx · {fraudPct.toFixed(1)}%
              </div>
            </div>
            <span className="text-xs text-slate-600 font-mono">{day.date?.slice(5) || i}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrainResult, setRetrainResult] = useState(null);
  const [retraining, setRetraining] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, w] = await Promise.all([getDailyInsights(), getWeeklyTrends(7)]);
      setInsights(d); setWeekly(Array.isArray(w) ? w : []);
    } catch { }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRetrain = async () => {
    setRetraining(true); setRetrainResult(null);
    try { const r = await triggerRetrain(); setRetrainResult(r); } catch { setRetrainResult({ error: 'Retrain failed' }); }
    setRetraining(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#030014' }}>
      <Background3D />

      {/* Nav */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-neon">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-indigo-400" />
            <span className="text-lg font-display font-bold tracking-wider">
              <span className="text-white">FRAUD</span><span className="gradient-text">SHIELD</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/detection" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiBolt /> DETECT</Link>
            <Link to="/forensics" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider">FORENSICS</Link>
            <Link to="/" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiHome /> HOME</Link>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen py-20 pt-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 glass-neon rounded-full px-5 py-2 mb-4">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
                <span className="text-sm text-slate-300 font-display font-semibold tracking-wider">LIVE MONITORING</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white">
                RISK <span className="gradient-text">DASHBOARD</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={load}
                className="btn-outline px-5 py-3 rounded-xl text-sm font-display tracking-wider flex items-center gap-2">
                <HiArrowPath className={loading ? 'animate-spin' : ''} /> REFRESH
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRetrain}
                disabled={retraining} className="btn-primary px-5 py-3 rounded-xl text-sm font-display tracking-wider text-white flex items-center gap-2 disabled:opacity-50">
                {retraining ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <HiBolt />} RETRAIN
              </motion.button>
            </div>
          </motion.div>

          {retrainResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 mb-6 border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-emerald-400 font-display font-semibold text-sm tracking-wider">
                Retrain: {retrainResult.message || retrainResult.error || 'Done'} {retrainResult.accuracy && ` · Accuracy: ${(retrainResult.accuracy * 100).toFixed(2)}%`}
              </p>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" /></div>
          ) : insights ? (
            <>
              {/* Metric cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <MetricCard icon={HiChartBar} label="TRANSACTIONS" value={insights.total_transactions} sub={`Date: ${insights.date}`} color="from-indigo-500 to-violet-600" delay={0.1} />
                <MetricCard icon={HiExclamationTriangle} label="FRAUD RATE" value={`${insights.fraud_percentage?.toFixed(1) ?? 0}%`} sub={`${insights.fraud_count ?? 0} flagged`} color="from-red-500 to-rose-600" delay={0.2} />
                <MetricCard icon={HiGlobeAlt} label="VPN USAGE" value={`${insights.vpn_usage?.percentage?.toFixed(0) ?? 0}%`} sub={`${insights.vpn_usage?.count ?? 0} detected`} color="from-yellow-500 to-orange-500" delay={0.3} />
                <MetricCard icon={HiMoon} label="NIGHTTIME" value={`${insights.nighttime_attacks?.count ?? 0}`} sub={`Fraud rate: ${insights.nighttime_attacks?.fraud_rate?.toFixed(0) ?? 0}%`} color="from-purple-500 to-pink-600" delay={0.4} />
              </div>

              {/* Risk distribution + Weekly chart */}
              <div className="grid lg:grid-cols-2 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                  className="glass rounded-2xl p-6 holographic">
                  <h3 className="font-display font-bold text-white mb-5 tracking-wider flex items-center gap-2">
                    <HiSignal className="text-indigo-400" /> RISK DISTRIBUTION
                  </h3>
                  <div className="space-y-4">
                    {['low', 'medium', 'high'].map((level) => {
                      const count = insights.risk_distribution?.[level] ?? 0;
                      const total = Math.max(insights.total_transactions, 1);
                      const pct = (count / total) * 100;
                      const colors = { low: { bg: 'bg-emerald-500', text: 'text-emerald-400' }, medium: { bg: 'bg-yellow-500', text: 'text-yellow-400' }, high: { bg: 'bg-red-500', text: 'text-red-400' } };
                      return (
                        <div key={level}>
                          <div className="flex justify-between mb-1.5">
                            <span className={`font-display font-bold text-xs tracking-wider ${colors[level].text}`}>{level.toUpperCase()}</span>
                            <span className="text-white font-display font-bold">{count}</span>
                          </div>
                          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full ${colors[level].bg} rounded-full`}
                              style={{ boxShadow: `0 0 8px ${level === 'low' ? '#10b981' : level === 'medium' ? '#f59e0b' : '#ef4444'}50` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                  className="glass rounded-2xl p-6 holographic">
                  <h3 className="font-display font-bold text-white mb-5 tracking-wider flex items-center gap-2">
                    <HiChartBar className="text-indigo-400" /> 7-DAY TREND
                  </h3>
                  <BarChart data={weekly} />
                </motion.div>
              </div>

              {/* IP Traffic — always visible */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="glass rounded-2xl p-6 holographic mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-white tracking-wider flex items-center gap-2">
                    <HiGlobeAlt className="text-indigo-400" /> IP TRAFFIC INTELLIGENCE
                  </h3>
                  <span className="text-xs font-display text-slate-500 tracking-wider">
                    {insights.ip_traffic?.heavy_traffic_count ?? 0} heavy traffic IPs
                  </span>
                </div>

                {/* Summary row */}
                <div className="grid sm:grid-cols-3 gap-3 mb-5">
                  <div className="glass-strong rounded-xl p-4 text-center">
                    <p className="text-xs font-display text-slate-500 tracking-wider mb-1">UNIQUE IPs</p>
                    <p className="text-2xl font-display font-black text-white">{insights.ip_traffic?.top_ips?.length ?? 0}</p>
                  </div>
                  <div className="glass-strong rounded-xl p-4 text-center">
                    <p className="text-xs font-display text-slate-500 tracking-wider mb-1">HEAVY TRAFFIC</p>
                    <p className="text-2xl font-display font-black text-yellow-400">{insights.ip_traffic?.heavy_traffic_count ?? 0}</p>
                  </div>
                  <div className="glass-strong rounded-xl p-4 text-center">
                    <p className="text-xs font-display text-slate-500 tracking-wider mb-1">VPN DETECTED</p>
                    <p className="text-2xl font-display font-black text-red-400">{insights.vpn_usage?.count ?? 0}</p>
                  </div>
                </div>

                {/* IP list */}
                {insights.ip_traffic?.top_ips?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {insights.ip_traffic.top_ips.map((item, i) => {
                      const ip = typeof item === 'string' ? item : (item.ip_address || '—');
                      const count = typeof item === 'object' ? (item.count || 0) : 0;
                      const risk = typeof item === 'object' ? (item.risk_level || 'Medium') : 'Medium';
                      const riskColor = risk === 'High' ? 'text-red-400 bg-red-500/15' : risk === 'Medium' ? 'text-yellow-400 bg-yellow-500/15' : 'text-emerald-400 bg-emerald-500/15';
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.05 }}
                          className="glass-strong rounded-xl p-4 group hover:glow-border transition-all duration-300">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-mono text-sm">{ip}</span>
                            <span className={`text-xs font-display font-bold px-2 py-0.5 rounded-lg ${riskColor}`}>{risk}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-mono text-xs">{count} transactions</span>
                            <span className="text-xs text-slate-600">●●● active</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 font-display text-sm">No IP traffic data yet — submit transactions to populate</p>
                  </div>
                )}
              </motion.div>

            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <HiChartBar className="text-5xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-display">No data available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

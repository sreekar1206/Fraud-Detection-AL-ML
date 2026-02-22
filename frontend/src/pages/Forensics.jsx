import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiShieldCheck, HiMagnifyingGlass, HiChartBar, HiHome, HiBolt,
  HiExclamationTriangle, HiClock, HiGlobeAlt, HiInformationCircle,
} from 'react-icons/hi2';
import { getAllForensics, getTransactionForensics } from '../services/api';
import Background3D from '../components/Background3D';

const RISK_GRAD = { Low: 'from-emerald-500 to-teal-500', Medium: 'from-yellow-500 to-orange-500', High: 'from-red-600 to-rose-600' };
const RISK_NEON = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

function MiniGauge({ score, level, size = 80 }) {
  const r = (size - 10) / 2, C = 2 * Math.PI * r;
  const pct = Math.min((score || 0) / 100, 1);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={RISK_NEON[level] || '#6366f1'} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }} className="gauge-ring" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-display font-black text-white">{score}%</span>
      </div>
    </div>
  );
}

export default function Forensics() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try { const d = await getAllForensics(100); setRecords(Array.isArray(d) ? d : []); } catch { setRecords([]); }
      setLoading(false);
    })();
  }, []);

  const loadDetail = async (id) => {
    if (!id) return;
    setSelected(id); setDetailLoading(true); setDetail(null);
    try { const d = await getTransactionForensics(id); setDetail(d); } catch { setDetail(null); }
    setDetailLoading(false);
  };

  const filtered = records.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.ip_address?.includes(search)
  );

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';

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
            <Link to="/dashboard" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiChartBar /> DASHBOARD</Link>
            <Link to="/" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiHome /> HOME</Link>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen py-20 pt-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white mb-4">
              FORENSIC <span className="gradient-text">ANALYSIS</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">Deep-dive into individual transactions with full ML pipeline results.</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <div className="relative max-w-md">
              <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search by name or IP..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full neon-input rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 font-medium" />
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" /></div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left — Transaction list */}
              <div className="lg:col-span-2 space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scroll">
                {filtered.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <HiMagnifyingGlass className="text-4xl text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-display">No records found</p>
                  </div>
                ) : filtered.map((rec, i) => {
                  const txId = rec.transaction_id || rec.id;
                  const isActive = selected === txId;
                  return (
                    <motion.div key={txId || i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => loadDetail(txId)}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all duration-300 group holographic ${isActive ? 'glow-border border-indigo-500/40' : 'hover:bg-white/[0.02]'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm">{rec.name}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-display font-bold text-white bg-gradient-to-r ${RISK_GRAD[rec.risk_level] || 'from-slate-500 to-slate-600'}`}>
                          {rec.risk_level || 'Low'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono">${Number(rec.amount).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <HiClock className="text-xs" /> {fmtDate(rec.timestamp).split(',')[0]}
                        </span>
                      </div>
                      {rec.is_vpn && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-yellow-400 font-display font-semibold">
                          <HiGlobeAlt /> VPN
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Right — Detail panel */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {detailLoading ? (
                    <motion.div key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="glass rounded-2xl p-12 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
                    </motion.div>
                  ) : detail ? (
                    <motion.div key="det" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="glass rounded-2xl p-8 holographic sticky top-28">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-display font-bold text-white tracking-wider">{detail.name}</h3>
                          <p className="text-slate-500 text-xs font-mono mt-1">TX #{detail.transaction_id || selected}</p>
                        </div>
                        <MiniGauge score={detail.risk_score ?? detail.fraud_probability ?? 0} level={detail.risk_level || 'Low'} />
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <InfoBox label="AMOUNT" value={`$${Number(detail.amount).toLocaleString()}`} />
                        <InfoBox label="IP" value={detail.ip_address || '—'} />
                        <InfoBox label="DEVICE" value={detail.device || '—'} />
                        <InfoBox label="FLAGGED" value={detail.flagged ? '🚨 YES' : '✅ NO'} highlight={detail.flagged} />
                        <InfoBox label="THRESHOLD" value={`${((detail.threshold_used || 0.5) * 100).toFixed(1)}%`} />
                        <InfoBox label="TRUST" value={`${((detail.trust_score || 0.5) * 100).toFixed(0)}%`} />
                      </div>

                      {/* Alerts */}
                      {detail.is_vpn && (
                        <div className="flex items-center gap-2 p-3 glass-strong rounded-lg border border-yellow-500/30 mb-3">
                          <HiExclamationTriangle className="text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-display font-semibold tracking-wider">VPN / PROXY DETECTED</span>
                        </div>
                      )}
                      {detail.graph_flagged && (
                        <div className="flex items-center gap-2 p-3 glass-strong rounded-lg border border-red-500/30 mb-3">
                          <HiExclamationTriangle className="text-red-400" />
                          <span className="text-red-400 text-sm font-display font-semibold tracking-wider">MULE NETWORK LINK</span>
                        </div>
                      )}
                      {detail.impossible_travel && (
                        <div className="flex items-center gap-2 p-3 glass-strong rounded-lg border border-orange-500/30 mb-3">
                          <HiExclamationTriangle className="text-orange-400" />
                          <span className="text-orange-400 text-sm font-display font-semibold tracking-wider">IMPOSSIBLE TRAVEL</span>
                        </div>
                      )}

                      {/* SHAP */}
                      {detail.shap_reasons?.length > 0 && (
                        <div className="glass-strong rounded-xl p-4 mt-4">
                          <p className="text-slate-400 text-xs mb-3 flex items-center gap-1 font-display tracking-wider">
                            <HiInformationCircle /> XAI RISK FACTORS
                          </p>
                          <ul className="space-y-1.5">{detail.shap_reasons.map((r, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-indigo-400 font-display font-bold">{i + 1}.</span> {r}
                            </li>
                          ))}</ul>
                        </div>
                      )}

                      {/* Behavioural metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-5 text-xs">
                        <Chip label="Vel 1h" value={detail.tx_count_1h ?? 0} />
                        <Chip label="Vol 24h" value={`$${(detail.tx_amount_sum_24h ?? 0).toLocaleString()}`} />
                        <Chip label="Ratio" value={`${(detail.amount_ratio ?? 1).toFixed(2)}x`} />
                      </div>

                      <p className="text-slate-600 text-xs mt-5 font-mono text-right">{fmtDate(detail.timestamp)}</p>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center holographic sticky top-28" style={{ minHeight: '400px' }}>
                      <HiMagnifyingGlass className="text-6xl text-indigo-500/20 mb-4" />
                      <p className="text-slate-500 font-display text-lg">Select a transaction</p>
                      <p className="text-slate-600 text-sm mt-2">Click any record to view the full ML analysis</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBox({ label, value, highlight }) {
  return (
    <div className={`glass-strong rounded-lg p-3 ${highlight ? 'border border-red-500/30' : ''}`}>
      <p className="text-slate-500 text-xs font-display tracking-wider mb-1">{label}</p>
      <p className={`font-medium text-sm ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div className="glass-strong rounded-lg p-2 text-center">
      <p className="text-slate-500 text-xs font-display tracking-wider">{label}</p>
      <p className="text-white font-display font-bold">{value}</p>
    </div>
  );
}

function fmtDate(iso) { return iso ? new Date(iso).toLocaleString() : '—'; }

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck, HiXCircle, HiBolt, HiHome,
  HiSparkles, HiClock, HiExclamationTriangle, HiInformationCircle,
  HiHandThumbUp, HiHandThumbDown, HiChartBar,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { submitTransaction, getHistory, submitFeedback } from '../services/api';
import Background3D from '../components/Background3D';

const RISK_GRAD = { Low: 'from-emerald-500 to-teal-500', Medium: 'from-yellow-500 to-orange-500', High: 'from-red-600 to-rose-600' };
const RISK_BG = { Low: 'bg-emerald-500/10', Medium: 'bg-yellow-500/10', High: 'bg-red-500/10' };
const RISK_NEON = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

/* SVG circular gauge */
function RiskGauge({ score, level, size = 160 }) {
  const r = (size - 16) / 2, C = 2 * Math.PI * r;
  const pct = Math.min((score || 0) / 100, 1);
  const color = RISK_NEON[level] || RISK_NEON.Low;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut' }} className="gauge-ring" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-black text-white">{score}%</span>
        <span className={`text-xs font-display font-bold tracking-wider mt-1`} style={{ color }}>{level} RISK</span>
      </div>
    </div>
  );
}

export default function Detection() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [device, setDevice] = useState('Mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedbackSent, setFeedbackSent] = useState({});
  const [historyLoading, setHistoryLoading] = useState(true);
  const formRef = useRef(null);

  const loadHistory = async () => {
    try { const h = await getHistory(); setHistory(Array.isArray(h) ? h : []); } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };
  useEffect(() => { loadHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setResult(null); setLoading(true);
    try {
      const data = await submitTransaction({ name, amount: parseFloat(amount), device });
      setResult(data); await loadHistory();
    } catch (err) { setError(err.message || 'Backend not reachable'); }
    finally { setLoading(false); }
  };

  const handleFeedback = async (txId, isFraud) => {
    if (!txId) return;
    try { await submitFeedback(txId, isFraud); setFeedbackSent(p => ({ ...p, [txId]: isFraud ? 'fraud' : 'legit' })); } catch { }
  };

  const handleCardMove = (e) => {
    if (!formRef.current) return;
    const r = formRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
    formRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
  };
  const handleCardLeave = () => { if (formRef.current) formRef.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)'; };

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
            <Link to="/dashboard" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiChartBar /> DASHBOARD</Link>
            <Link to="/forensics" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider">FORENSICS</Link>
            <Link to="/" className="btn-outline px-4 py-2 rounded-xl text-sm font-display tracking-wider flex items-center gap-2"><HiHome /> HOME</Link>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen py-20 pt-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass-neon rounded-full px-6 py-2.5 mb-8">
              <HiSparkles className="text-emerald-400" />
              <span className="text-sm text-slate-300 font-display font-semibold tracking-wider">NEURAL ENGINE v3.0</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-white mb-4">
              REAL-TIME <span className="gradient-text">DETECTION</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Ensemble ML · Behavioral Analysis · SHAP Explainability · Dynamic Thresholds
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-xl p-4 mb-6 border border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <HiXCircle className="text-red-400 text-xl flex-shrink-0" />
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Form with 3D tilt */}
            <motion.form onSubmit={handleSubmit} ref={formRef} onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}
              initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-2xl p-8 holographic" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease' }}>
              <h3 className="text-xl font-display font-bold text-white mb-6 tracking-wider flex items-center gap-2">
                <HiBolt className="text-indigo-400" /> ANALYSE TRANSACTION
              </h3>

              <label className="block mb-5">
                <span className="text-slate-400 text-sm mb-2 block font-display tracking-wider text-xs">CUSTOMER NAME</span>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alice Johnson"
                  className="w-full neon-input rounded-xl px-4 py-3.5 text-white placeholder-slate-600 font-medium" />
              </label>
              <label className="block mb-5">
                <span className="text-slate-400 text-sm mb-2 block font-display tracking-wider text-xs">AMOUNT (USD)</span>
                <input type="number" required min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000"
                  className="w-full neon-input rounded-xl px-4 py-3.5 text-white placeholder-slate-600 font-medium" />
              </label>
              <label className="block mb-7">
                <span className="text-slate-400 text-sm mb-2 block font-display tracking-wider text-xs">DEVICE TYPE</span>
                <select value={device} onChange={(e) => setDevice(e.target.value)}
                  className="w-full neon-input rounded-xl px-4 py-3.5 text-white appearance-none font-medium">
                  <option value="Mobile">Mobile</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </label>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 rounded-xl font-display font-bold text-lg tracking-wider disabled:opacity-50 flex items-center justify-center gap-3">
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> ANALYSING…</>
                  : <><HiBolt className="text-xl" /> LAUNCH ANALYSIS</>}
              </button>
            </motion.form>

            {/* Result */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="r" initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
                  className={`glass rounded-2xl p-8 border border-slate-700 holographic`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white tracking-wider">ANALYSIS RESULT</h3>
                      <p className="text-slate-500 text-xs font-mono mt-1">XGBoost + IsolationForest</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-sm font-display font-bold text-white bg-gradient-to-r ${RISK_GRAD[result.risk_level]}`}>
                      {result.risk_level}
                    </span>
                  </div>

                  <div className="flex justify-center mb-6">
                    <RiskGauge score={result.risk_score} level={result.risk_level} />
                  </div>

                  <div className="space-y-2 mb-5">
                    <Row label="Name" value={result.name} />
                    <Row label="Amount" value={`$${Number(result.amount).toLocaleString()}`} />
                    <Row label="IP" value={result.ip_address} />
                    <Row label="Threshold" value={`${((result.threshold_used || 0.5) * 100).toFixed(1)}%`} />
                    <Row label="Flagged" value={result.flagged ? '🚨 FLAGGED' : '✅ CLEAR'} highlight={result.flagged} />
                  </div>

                  {result.is_vpn && (
                    <div className="flex items-center gap-2 p-3 glass-strong rounded-lg border border-yellow-500/30 mb-3">
                      <HiExclamationTriangle className="text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-display font-semibold tracking-wider">VPN DETECTED</span>
                    </div>
                  )}
                  {result.graph_flagged && (
                    <div className="flex items-center gap-2 p-3 glass-strong rounded-lg border border-red-500/30 mb-3">
                      <HiExclamationTriangle className="text-red-400" />
                      <span className="text-red-400 text-sm font-display font-semibold tracking-wider">MULE NETWORK LINK</span>
                    </div>
                  )}

                  {result.shap_reasons?.length > 0 && (
                    <div className="glass-strong rounded-xl p-4 mb-4">
                      <p className="text-slate-400 text-sm mb-2 flex items-center gap-1 font-display tracking-wider text-xs"><HiInformationCircle /> XAI RISK FACTORS</p>
                      <ul className="space-y-1">{result.shap_reasons.map((r, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-400 font-display font-bold">{i + 1}.</span> {r}
                        </li>
                      ))}</ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Chip label="Velocity 1h" value={result.tx_count_1h ?? 0} />
                    <Chip label="Volume 24h" value={`$${(result.tx_amount_sum_24h ?? 0).toLocaleString()}`} />
                    <Chip label="Amt Ratio" value={`${(result.amount_ratio ?? 1).toFixed(2)}x`} />
                    <Chip label="Trust" value={`${((result.trust_score ?? 0.5) * 100).toFixed(0)}%`} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center holographic">
                  <HiShieldCheck className="text-7xl text-indigo-500/30 mb-4" />
                  <p className="text-slate-500 text-lg font-display">Submit a transaction</p>
                  <p className="text-slate-600 text-sm mt-2">Full ML pipeline returns in &lt;3ms</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History with Admin Feedback */}
          {historyLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" /></div>
          ) : history.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <h3 className="text-xl font-display font-bold text-white mb-5 tracking-wider flex items-center gap-2">
                <HiClock className="text-indigo-400" /> TRANSACTION LOG
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="text-slate-500 border-b border-slate-800 font-display text-xs tracking-wider">
                    <th className="pb-3 pr-4">NAME</th><th className="pb-3 pr-4">AMOUNT</th><th className="pb-3 pr-4">RISK</th>
                    <th className="pb-3 pr-4">SCORE</th><th className="pb-3 pr-4">FLAG</th><th className="pb-3 pr-4">TIME</th><th className="pb-3">ADMIN</th>
                  </tr></thead>
                  <tbody>
                    {history.map((tx, i) => {
                      const txId = tx.id || i; const fb = feedbackSent[txId];
                      return (
                        <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-800/50 hover:bg-white/[0.02] transition">
                          <td className="py-3 pr-4 text-white font-medium">{tx.name}</td>
                          <td className="py-3 pr-4 text-white font-mono">${Number(tx.amount).toLocaleString()}</td>
                          <td className="py-3 pr-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold text-white bg-gradient-to-r ${RISK_GRAD[tx.risk_level] || ''}`}>{tx.risk_level || 'Low'}</span>
                          </td>
                          <td className="py-3 pr-4 text-white font-display font-bold">{(tx.risk_score ?? tx.fraud_probability ?? 0).toFixed(1)}%</td>
                          <td className="py-3 pr-4">{tx.flagged ? '🚨' : '✅'}</td>
                          <td className="py-3 pr-4 text-slate-500 text-xs font-mono whitespace-nowrap">{fmtDate(tx.timestamp)}</td>
                          <td className="py-3">
                            {fb ? (
                              <span className={`text-xs font-display font-bold px-2 py-1 rounded tracking-wider ${fb === 'fraud' ? 'text-red-400 bg-red-500/15' : 'text-emerald-400 bg-emerald-500/15'}`}>
                                {fb === 'fraud' ? '✓ FRAUD' : '✓ LEGIT'}
                              </span>
                            ) : (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleFeedback(txId, true)} className="px-2 py-1 text-xs rounded bg-red-500/15 text-red-400 hover:bg-red-500/30 transition flex items-center gap-1 font-display"><HiHandThumbDown /> FRAUD</button>
                                <button onClick={() => handleFeedback(txId, false)} className="px-2 py-1 text-xs rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition flex items-center gap-1 font-display"><HiHandThumbUp /> LEGIT</button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8 text-center">
              <HiClock className="text-4xl text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-display">No transactions yet — submit one above.</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between items-center p-3 glass-strong rounded-lg ${highlight ? 'border border-red-500/30' : ''}`}>
      <span className="text-slate-500 text-xs font-display tracking-wider">{label}</span>
      <span className={`font-medium text-sm ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div className="glass-strong rounded-lg p-2.5 text-center">
      <p className="text-slate-500 text-xs font-display tracking-wider">{label}</p>
      <p className="text-white font-display font-bold">{value}</p>
    </div>
  );
}

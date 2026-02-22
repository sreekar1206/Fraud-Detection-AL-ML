import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck,
  HiXCircle,
  HiCheckCircle,
  HiBolt,
  HiHome,
  HiSparkles,
  HiClock,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { submitTransaction, getHistory } from '../services/api';
import Background3D from '../components/Background3D';

const RISK_COLORS = {
  Low: 'from-emerald-500 to-teal-500',
  Medium: 'from-yellow-500 to-orange-500',
  High: 'from-red-600 to-rose-600',
};

const RISK_BORDER = {
  Low: 'border-emerald-500/40',
  Medium: 'border-yellow-500/40',
  High: 'border-red-500/40',
};

export default function Detection() {
  /* ── form state ── */
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [device, setDevice] = useState('Mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── result + history ── */
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  /* load history on mount */
  useEffect(() => {
    getHistory().then(setHistory).catch(() => { });
  }, []);

  /* ── submit handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await submitTransaction({
        name,
        amount: parseFloat(amount),
        device,
      });
      setResult(data);
      // refresh history
      const h = await getHistory();
      setHistory(h);
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Is the backend running on http://localhost:8000?'
      );
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="relative bg-dark-900 min-h-screen overflow-x-hidden">
      <Background3D />

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <HiShieldCheck className="text-2xl text-indigo-400" />
            <span className="text-lg font-bold">
              <span className="text-white">Fraud</span>
              <span className="gradient-text">Shield</span>
            </span>
          </Link>
          <Link
            to="/"
            className="btn-outline px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <HiHome className="text-lg" />
            Home
          </Link>
        </div>
      </motion.nav>

      <section className="relative min-h-screen py-20 pt-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <HiSparkles className="text-emerald-400" />
              <span className="text-sm text-slate-300 font-medium">
                Real-Time ML Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Real-Time <span className="gradient-text">Fraud Detection</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Enter a transaction below and let our AI instantly evaluate the
              fraud risk.
            </p>
          </motion.div>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-xl p-4 mb-6 border-2 border-red-500/30 bg-red-500/10"
              >
                <div className="flex items-center gap-3">
                  <HiXCircle className="text-red-400 text-xl flex-shrink-0" />
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* ── Form ── */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <HiBolt className="text-indigo-400" />
                Analyse Transaction
              </h3>

              {/* Name */}
              <label className="block mb-5">
                <span className="text-slate-400 text-sm mb-1 block">
                  Customer Name
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Johnson"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </label>

              {/* Amount */}
              <label className="block mb-5">
                <span className="text-slate-400 text-sm mb-1 block">
                  Amount (USD)
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </label>

              {/* Device */}
              <label className="block mb-6">
                <span className="text-slate-400 text-sm mb-1 block">
                  Device Type
                </span>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition appearance-none"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <HiBolt className="text-xl" />
                    Analyse Transaction
                  </>
                )}
              </button>
            </motion.form>

            {/* ── Result card ── */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className={`glass rounded-2xl p-8 border-2 ${RISK_BORDER[result.risk_level] || 'border-slate-700'
                    }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      Analysis Result
                    </h3>
                    <span
                      className={`px-4 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${RISK_COLORS[result.risk_level] || ''
                        }`}
                    >
                      {result.risk_level} Risk
                    </span>
                  </div>

                  <div className="space-y-4">
                    <Row label="Name" value={result.name} />
                    <Row
                      label="Amount"
                      value={`$${Number(result.amount).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 }
                      )}`}
                    />
                    <Row label="IP Address" value={result.ip_address} />

                    {/* probability bar */}
                    <div className="glass-strong rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">
                        Fraud Probability
                      </p>
                      <p className="text-3xl font-bold text-white mb-2">
                        {result.fraud_probability}%
                      </p>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${result.fraud_probability}%`,
                          }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${RISK_COLORS[result.risk_level] || ''
                            }`}
                        />
                      </div>
                    </div>

                    <Row label="Timestamp" value={fmtDate(result.timestamp)} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                >
                  <HiShieldCheck className="text-6xl text-indigo-500/40 mb-4" />
                  <p className="text-slate-500 text-lg">
                    Submit a transaction to see the analysis
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── History ── */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <HiClock className="text-indigo-400" />
                Transaction History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">IP</th>
                      <th className="pb-3 pr-4">Probability</th>
                      <th className="pb-3 pr-4">Risk</th>
                      <th className="pb-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3 pr-4 text-white font-medium">
                          {tx.name}
                        </td>
                        <td className="py-3 pr-4 text-white">
                          ${Number(tx.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 pr-4 text-slate-400">
                          {tx.ip_address}
                        </td>
                        <td className="py-3 pr-4 text-white font-semibold">
                          {tx.fraud_probability}%
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${RISK_COLORS[tx.risk_level] || ''
                              }`}
                          >
                            {tx.risk_level}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-xs whitespace-nowrap">
                          {fmtDate(tx.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

/* helper component */
function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 glass-strong rounded-lg">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

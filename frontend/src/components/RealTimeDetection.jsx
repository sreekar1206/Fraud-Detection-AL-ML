import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiShieldCheck, HiXCircle, HiCheckCircle, HiCpuChip, HiBolt } from 'react-icons/hi2';
import { api, generateRandomTransaction } from '../services/api';

const RISK_COLORS = {
  LOW: 'from-emerald-500 to-teal-500',
  MEDIUM: 'from-yellow-500 to-orange-500',
  HIGH: 'from-orange-500 to-red-500',
  CRITICAL: 'from-red-600 to-rose-600',
};

const RISK_ICONS = {
  LOW: HiCheckCircle,
  MEDIUM: HiShieldCheck,
  HIGH: HiXCircle,
  CRITICAL: HiXCircle,
};

export default function RealTimeDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelTrained, setModelTrained] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [step, setStep] = useState(0); // 0: idle, 1: generating, 2: preprocessing, 3: analyzing, 4: complete

  // Check if model is trained on mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      // Try to get stats - if it works, model might be trained
      await api.getStats();
      setModelTrained(true);
    } catch (err) {
      setModelTrained(false);
    }
  };

  const trainModel = async () => {
    setIsAnalyzing(true);
    setError(null);
    setStep(1);

    try {
      setStep(2);
      const result = await api.trainModel();
      setModelTrained(true);
      setStep(0);
      alert(`Model trained successfully!\nBest Model: ${result.best_model}\nF1 Score: ${result.metrics.f1_score}`);
    } catch (err) {
      setError(err.message);
      setStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTransaction = async () => {
    if (!modelTrained) {
      alert('Please train the model first!');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setPrediction(null);
    setStep(1); // Generating

    // Generate random transaction
    const transaction = generateRandomTransaction();
    setCurrentTransaction(transaction);

    // Simulate processing steps
    setTimeout(() => setStep(2), 500); // Preprocessing
    setTimeout(() => setStep(3), 1000); // Analyzing

    try {
      const result = await api.predictFraud(transaction);
      setPrediction(result);
      setHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
      setStep(4); // Complete

      // Update stats
      try {
        const statsData = await api.getStats();
        setStats(statsData);
      } catch (err) {
        // Stats might fail, that's okay
      }
    } catch (err) {
      setError(err.message);
      setStep(0);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setStep(0), 2000);
    }
  };


  const getRiskColor = (riskLevel) => {
    return RISK_COLORS[riskLevel] || RISK_COLORS.LOW;
  };

  const getRiskIcon = (riskLevel) => {
    const Icon = RISK_ICONS[riskLevel] || HiCheckCircle;
    return Icon;
  };

  const stepMessages = {
    1: 'Generating Transaction Data...',
    2: 'Preprocessing Features...',
    3: 'Running ML Analysis...',
    4: 'Analysis Complete!',
  };

  return (
    <section id="detection" className="relative min-h-screen py-20 z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Real-Time <span className="gradient-text">Threat Detection</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Watch our ML models analyze transactions in real-time. Generate random transactions and see how our AI detects fraud.
          </p>
        </motion.div>

        {/* Model Training Status */}
        {!modelTrained && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 mb-8 border-2 border-yellow-500/30"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">⚠️ Model Not Trained</h3>
                <p className="text-slate-400">
                  You need to train the ML model before analyzing transactions.
                </p>
              </div>
              <button
                onClick={trainModel}
                disabled={isAnalyzing}
                className="btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Training...' : 'Train Model'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-6 border-2 border-red-500/30 bg-red-500/10"
          >
            <p className="text-red-400 font-medium">Error: {error}</p>
          </motion.div>
        )}

        {/* Control Panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Action Buttons */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={analyzeTransaction}
                disabled={isAnalyzing || !modelTrained}
                className="btn-primary px-6 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <HiBolt className="text-xl" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Random Transaction'}
              </button>
            </div>

            {/* Processing Steps */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 space-y-2"
              >
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      step >= s
                        ? 'bg-indigo-500/20 border border-indigo-500/50'
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step >= s ? 'bg-indigo-400' : 'bg-slate-600'
                      }`}
                    />
                    <span className="text-sm text-slate-300">
                      {stepMessages[s]}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Current Transaction */}
          {currentTransaction && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-semibold">${currentTransaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white">{currentTransaction.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device:</span>
                  <span className="text-white">{currentTransaction.device_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant:</span>
                  <span className="text-white">{currentTransaction.merchant_id}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Prediction Result */}
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-2xl p-8 mb-8 glow-border"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">ML Analysis Result</h3>
                  <p className="text-slate-400">Model: {prediction.model_used}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-br ${getRiskColor(prediction.risk_level)}`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getRiskIcon(prediction.risk_level);
                      return <Icon className="text-xl text-white" />;
                    })()}
                    <span className="text-white font-bold">{prediction.risk_level}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Fraud Probability */}
                <div className="glass-strong rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-2">Fraud Probability</p>
                  <p className="text-3xl font-bold text-white">
                    {(prediction.fraud_probability * 100).toFixed(2)}%
                  </p>
                  <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.fraud_probability * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${getRiskColor(prediction.risk_level)}`}
                    />
                  </div>
                </div>

                {/* Fraud Score */}
                <div className="glass-strong rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-2">Fraud Score</p>
                  <p className="text-3xl font-bold text-white">{prediction.fraud_score}</p>
                  <p className="text-xs text-slate-500 mt-2">Out of 100</p>
                </div>

                {/* Is Fraud */}
                <div className="glass-strong rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-2">Detection</p>
                  <div className="flex items-center gap-2">
                    {prediction.is_fraud ? (
                      <>
                        <HiXCircle className="text-3xl text-red-500" />
                        <span className="text-xl font-bold text-red-400">FRAUD DETECTED</span>
                      </>
                    ) : (
                      <>
                        <HiCheckCircle className="text-3xl text-emerald-500" />
                        <span className="text-xl font-bold text-emerald-400">LEGITIMATE</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-strong rounded-xl p-4">
                <p className="text-slate-300">{prediction.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Overall Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.total_transactions}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Fraud Detected</p>
                <p className="text-2xl font-bold text-red-400">{stats.total_fraud}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Legitimate</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.total_legitimate}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Fraud Rate</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.fraud_rate}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recent Analyses</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="glass-strong rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.is_fraud ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium">
                        Transaction #{item.transaction_id} - ${item.amount}
                      </p>
                      <p className="text-slate-400 text-sm">{item.model_used}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r ${getRiskColor(item.risk_level)} text-white`}>
                      {item.risk_level}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {(item.fraud_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

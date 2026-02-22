import { motion } from 'framer-motion'
import { HiCloudArrowUp, HiFunnel, HiCpuChip, HiCheckBadge } from 'react-icons/hi2'

const steps = [
    {
        icon: HiCloudArrowUp, number: '01', title: 'DATA INGESTION',
        description: 'Transaction streams through secure API endpoints with end-to-end encryption and real-time validation.',
        color: 'from-indigo-500 to-blue-500', neon: '#6366f1',
    },
    {
        icon: HiFunnel, number: '02', title: 'FEATURE ENGINEERING',
        description: 'Behavioral velocity, geospatial analysis, device fingerprinting, and 20+ engineered features.',
        color: 'from-violet-500 to-purple-500', neon: '#a855f7',
    },
    {
        icon: HiCpuChip, number: '03', title: 'ENSEMBLE ANALYSIS',
        description: 'XGBoost + IsolationForest ensemble with SHAP explainability generates weighted risk scores.',
        color: 'from-purple-500 to-pink-500', neon: '#ec4899',
    },
    {
        icon: HiCheckBadge, number: '04', title: 'RISK SCORING & ACTION',
        description: 'Dynamic thresholds, graph contagion analysis, and automated alerting in under 3ms.',
        color: 'from-emerald-500 to-teal-500', neon: '#06d6a0',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-32 z-10">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px] animate-aurora" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-display font-bold text-indigo-400 tracking-[0.3em]">PIPELINE</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white mt-4 mb-6">
                        HOW IT <span className="gradient-text">WORKS</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        From ingestion to risk scoring — a fully automated, intelligent pipeline.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Neon vertical line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
                        <div className="w-full h-full bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-emerald-500/50" />
                        {/* Traveling light */}
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-transparent via-indigo-400 to-transparent opacity-60"
                            style={{ animation: 'data-flow 4s linear infinite' }} />
                    </div>

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.19, 1, 0.22, 1] }}
                            className={`relative flex items-start gap-8 mb-20 last:mb-0 ${i % 2 === 0 ? 'md:flex-row md:text-right' : 'md:flex-row-reverse md:text-left'
                                }`}
                        >
                            {/* Timeline node with pulse */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.color} ring-4 ring-dark-950`}
                                    style={{ boxShadow: `0 0 15px ${step.neon}60` }} />
                                <div className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br ${step.color}`}
                                    style={{ animation: 'pulse-ring 3s ease-out infinite', animationDelay: `${i * 0.5}s` }} />
                            </div>

                            {/* Card */}
                            <div className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-0' : 'md:pl-0'}`}>
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    transition={{ duration: 0.3 }}
                                    className="glass rounded-2xl p-7 group hover:glow-border transition-all duration-500 holographic"
                                >
                                    <div className={`inline-flex items-center gap-3 mb-4 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}
                                            style={{ boxShadow: `0 0 20px ${step.neon}30` }}>
                                            <step.icon className="text-xl text-white" />
                                        </div>
                                        <span className="text-xs font-display font-bold text-slate-500 tracking-[0.3em]">STEP {step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white mb-3 tracking-wider">{step.title}</h3>
                                    <p className="text-slate-400 text-[15px] leading-relaxed">{step.description}</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

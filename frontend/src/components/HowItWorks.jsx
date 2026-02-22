import { motion } from 'framer-motion'
import { HiCloudArrowUp, HiFunnel, HiCpuChip, HiCheckBadge } from 'react-icons/hi2'

const steps = [
    {
        icon: HiCloudArrowUp,
        number: '01',
        title: 'Data Ingestion',
        description: 'Transaction data streams in real-time through our secure API endpoints with end-to-end encryption.',
        color: 'from-indigo-500 to-blue-500',
    },
    {
        icon: HiFunnel,
        number: '02',
        title: 'Smart Preprocessing',
        description: 'Feature engineering, categorical encoding, and normalization prepare raw data for ML consumption.',
        color: 'from-violet-500 to-purple-500',
    },
    {
        icon: HiCpuChip,
        number: '03',
        title: 'ML Analysis',
        description: 'Ensemble of trained models — Random Forest, XGBoost, Isolation Forest — analyzes transaction patterns.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: HiCheckBadge,
        number: '04',
        title: 'Risk Scoring & Action',
        description: 'Each transaction receives a fraud probability score. High-risk transactions trigger immediate alerts.',
        color: 'from-emerald-500 to-teal-500',
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-32 z-10">
            {/* Background accent */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Process</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-5">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        From data ingestion to risk scoring — a fully automated, intelligent pipeline.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent md:-translate-x-px" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            className={`relative flex items-start gap-8 mb-16 last:mb-0 ${i % 2 === 0
                                    ? 'md:flex-row md:text-right'
                                    : 'md:flex-row-reverse md:text-left'
                                }`}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.color} ring-4 ring-dark-900`} />
                                <div className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-br ${step.color} animate-ping opacity-30`} />
                            </div>

                            {/* Content Card */}
                            <div className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-0' : 'md:pl-0'}`}>
                                <div className="glass rounded-2xl p-6 group hover:glow-border transition-all duration-500">
                                    <div className={`inline-flex items-center gap-3 mb-4 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                                            <step.icon className="text-xl text-white" />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">STEP {step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-400 text-[15px] leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

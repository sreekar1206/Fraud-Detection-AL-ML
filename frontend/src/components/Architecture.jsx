import { motion } from 'framer-motion'
import { HiCloud, HiCog6Tooth, HiCpuChip, HiChartBar, HiBell } from 'react-icons/hi2'

const nodes = [
    { icon: HiCloud, label: 'INGESTION', sublabel: 'API Gateway', color: 'from-blue-500 to-indigo-500', neon: '#6366f1' },
    { icon: HiCog6Tooth, label: 'FEATURES', sublabel: 'Engine', color: 'from-indigo-500 to-violet-500', neon: '#8b5cf6' },
    { icon: HiCpuChip, label: 'ML MODELS', sublabel: 'Ensemble', color: 'from-violet-500 to-purple-500', neon: '#a855f7' },
    { icon: HiChartBar, label: 'RISK SCORE', sublabel: 'Probability', color: 'from-purple-500 to-pink-500', neon: '#ec4899' },
    { icon: HiBell, label: 'ALERTS', sublabel: 'Dispatch', color: 'from-emerald-500 to-teal-500', neon: '#06d6a0' },
]

function DataFlowArrow({ delay }) {
    return (
        <div className="hidden md:flex items-center relative" style={{ width: '48px' }}>
            {/* Static line */}
            <div className="w-full h-px bg-gradient-to-r from-indigo-500/30 to-violet-500/30" />
            {/* Arrow */}
            <div className="absolute right-0 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-violet-500/50" />
            {/* Traveling dot */}
            <motion.div
                className="absolute left-0 w-2 h-2 rounded-full bg-indigo-400"
                style={{ boxShadow: '0 0 8px #6366f1, 0 0 16px #6366f1' }}
                animate={{ x: [0, 40, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: delay * 0.4, ease: 'easeInOut' }}
            />
        </div>
    )
}

export default function Architecture() {
    return (
        <section id="architecture" className="relative py-32 z-10">
            <div className="absolute inset-0">
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[150px] animate-aurora"
                    style={{ animationDelay: '3s' }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-display font-bold text-indigo-400 tracking-[0.3em]">SYSTEM</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white mt-4 mb-6">
                        NEURAL <span className="gradient-text">ARCHITECTURE</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        A clean, modular pipeline designed for scalability and real-time performance.
                    </p>
                </motion.div>

                {/* Flow Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                    {nodes.map((node, i) => (
                        <div key={node.label} className="flex items-center gap-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
                                whileHover={{ scale: 1.08, y: -6 }}
                                className="glass rounded-2xl p-6 text-center cursor-pointer hover:glow-border transition-all duration-500 min-w-[140px] group holographic"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500`}
                                    style={{ boxShadow: `0 0 20px ${node.neon}30` }}>
                                    <node.icon className="text-xl text-white" />
                                </div>
                                <h4 className="text-white font-display font-bold text-xs tracking-wider mb-1">{node.label}</h4>
                                <p className="text-slate-500 text-xs font-mono">{node.sublabel}</p>
                            </motion.div>

                            {/* Animated connector with traveling data dot */}
                            {i < nodes.length - 1 && <DataFlowArrow delay={i} />}

                            {/* Mobile arrows */}
                            {i < nodes.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.12 + 0.3 }}
                                    className="md:hidden flex flex-col items-center py-1"
                                >
                                    <div className="h-4 w-px bg-gradient-to-b from-indigo-500/40 to-violet-500/40" />
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-violet-500/50" />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom detail cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-20 grid sm:grid-cols-3 gap-6"
                >
                    {[
                        { label: 'MODELS', value: '4 Algorithms', desc: 'XGB, IF, RF, LR', color: 'text-indigo-400' },
                        { label: 'DATABASE', value: 'SQLite + ORM', desc: 'SQLAlchemy', color: 'text-purple-400' },
                        { label: 'API', value: 'FastAPI', desc: 'Async REST', color: 'text-emerald-400' },
                    ].map((item) => (
                        <div key={item.label} className="glass rounded-2xl p-6 text-center group hover:glow-border transition-all duration-500 holographic">
                            <p className={`text-xs font-display font-bold ${item.color} tracking-[0.3em] mb-1`}>{item.label}</p>
                            <p className="text-white font-display font-bold text-xl">{item.value}</p>
                            <p className="text-slate-500 text-sm mt-1 font-mono">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

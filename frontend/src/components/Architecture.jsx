import { motion } from 'framer-motion'
import { HiCloud, HiCog6Tooth, HiCpuChip, HiChartBar, HiBell } from 'react-icons/hi2'

const nodes = [
    { icon: HiCloud, label: 'Data Ingestion', sublabel: 'API Gateway', color: 'from-blue-500 to-indigo-500' },
    { icon: HiCog6Tooth, label: 'Preprocessing', sublabel: 'Feature Engine', color: 'from-indigo-500 to-violet-500' },
    { icon: HiCpuChip, label: 'ML Models', sublabel: 'Ensemble Pipeline', color: 'from-violet-500 to-purple-500' },
    { icon: HiChartBar, label: 'Risk Scoring', sublabel: 'Probability Engine', color: 'from-purple-500 to-pink-500' },
    { icon: HiBell, label: 'Alert System', sublabel: 'Action Dispatch', color: 'from-emerald-500 to-teal-500' },
]

export default function Architecture() {
    return (
        <section id="architecture" className="relative py-32 z-10">
            {/* Background accent */}
            <div className="absolute inset-0">
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Architecture</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-5">
                        System <span className="gradient-text">Architecture</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        A clean, modular pipeline designed for scalability and real-time performance.
                    </p>
                </motion.div>

                {/* Flow Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="flex items-center gap-4"
                        >
                            {/* Node Card */}
                            <motion.div
                                whileHover={{ scale: 1.05, y: -4 }}
                                transition={{ duration: 0.25 }}
                                className="glass rounded-2xl p-6 text-center cursor-pointer hover:glow-border transition-all duration-500 min-w-[160px] group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                    <node.icon className="text-xl text-white" />
                                </div>
                                <h4 className="text-white font-semibold text-sm mb-1">{node.label}</h4>
                                <p className="text-slate-500 text-xs font-mono">{node.sublabel}</p>
                            </motion.div>

                            {/* Arrow Connector */}
                            {i < nodes.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    whileInView={{ opacity: 1, scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.12 + 0.3 }}
                                    className="hidden md:flex items-center"
                                >
                                    <div className="w-8 h-px bg-gradient-to-r from-indigo-500/60 to-violet-500/60" />
                                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-violet-500/60" />
                                </motion.div>
                            )}

                            {/* Mobile Arrow (Down) */}
                            {i < nodes.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.12 + 0.3 }}
                                    className="md:hidden flex flex-col items-center"
                                >
                                    <div className="h-6 w-px bg-gradient-to-b from-indigo-500/60 to-violet-500/60" />
                                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-violet-500/60" />
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Detail Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-20 grid sm:grid-cols-3 gap-6"
                >
                    {[
                        { label: 'Models', value: '4 Algorithms', desc: 'LR, RF, XGB, IF' },
                        { label: 'Database', value: 'SQLite + ORM', desc: 'SQLAlchemy powered' },
                        { label: 'API', value: 'FastAPI', desc: 'Async REST endpoints' },
                    ].map((item, i) => (
                        <div key={item.label} className="glass rounded-2xl p-5 text-center">
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-white font-bold text-lg">{item.value}</p>
                            <p className="text-slate-500 text-sm mt-1 font-mono">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

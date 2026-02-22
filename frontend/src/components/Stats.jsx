import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const stats = [
    {
        value: 99.7,
        suffix: '%',
        label: 'Detection Accuracy',
        description: 'Across all transaction types',
        color: 'text-emerald-400',
        glowColor: 'bg-emerald-500/10',
    },
    {
        value: 2.4,
        suffix: 'M+',
        label: 'Transactions Analyzed',
        description: 'Processed securely per day',
        decimals: 1,
        color: 'text-indigo-400',
        glowColor: 'bg-indigo-500/10',
    },
    {
        value: 0.003,
        suffix: 's',
        label: 'Response Time',
        description: 'Average prediction latency',
        decimals: 3,
        color: 'text-violet-400',
        glowColor: 'bg-violet-500/10',
    },
    {
        value: 47,
        suffix: '%',
        label: 'Fraud Reduction',
        description: 'Average decrease in chargebacks',
        color: 'text-cyan-400',
        glowColor: 'bg-cyan-500/10',
    },
]

export default function Stats() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    })

    return (
        <section id="stats" className="relative py-32 z-10">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Performance</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-5">
                        Numbers That <span className="gradient-text">Speak</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Industry-leading metrics backed by rigorous testing and real-world deployment.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="glass rounded-2xl p-8 text-center group hover:glow-border transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Background glow */}
                            <div className={`absolute inset-0 ${stat.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                            <div className="relative z-10">
                                <div className={`text-4xl sm:text-5xl font-black ${stat.color} mb-2 font-mono`}>
                                    {inView ? (
                                        <CountUp
                                            end={stat.value}
                                            duration={2.5}
                                            decimals={stat.decimals || 0}
                                            suffix={stat.suffix}
                                            enableScrollSpy={false}
                                        />
                                    ) : (
                                        <span>0{stat.suffix}</span>
                                    )}
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-1">{stat.label}</h3>
                                <p className="text-slate-500 text-sm">{stat.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

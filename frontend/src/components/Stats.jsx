import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const stats = [
    { value: 99.7, suffix: '%', label: 'DETECTION ACCURACY', desc: 'Across all transaction types', color: 'text-emerald-400', ring: '#10b981', bg: 'from-emerald-500/10 to-emerald-500/5' },
    { value: 2.4, suffix: 'M+', label: 'TRANSACTIONS', desc: 'Processed securely per day', decimals: 1, color: 'text-indigo-400', ring: '#6366f1', bg: 'from-indigo-500/10 to-indigo-500/5' },
    { value: 3, suffix: 'ms', label: 'RESPONSE TIME', desc: 'Average prediction latency', color: 'text-purple-400', ring: '#a855f7', bg: 'from-purple-500/10 to-purple-500/5' },
    { value: 47, suffix: '%', label: 'FRAUD REDUCTION', desc: 'Average decrease in chargebacks', color: 'text-cyan-400', ring: '#38bdf8', bg: 'from-cyan-500/10 to-cyan-500/5' },
]

function RadialGauge({ value, max, color, size = 100 }) {
    const radius = (size - 10) / 2
    const circumference = 2 * Math.PI * radius
    const pct = Math.min(value / max, 1)
    const offset = circumference * (1 - pct)

    return (
        <svg width={size} height={size} className="mx-auto mb-4 -rotate-90">
            {/* Track */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            {/* Gauge */}
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={color} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                whileInView={{ strokeDashoffset: offset }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
                className="gauge-ring"
            />
        </svg>
    )
}

export default function Stats() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

    return (
        <section id="stats" className="relative py-32 z-10">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-display font-bold text-indigo-400 tracking-[0.3em]">PERFORMANCE</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white mt-4 mb-6">
                        NUMBERS THAT <span className="gradient-text">SPEAK</span>
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
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
                            className={`glass rounded-2xl p-8 text-center group hover:glow-border transition-all duration-500 relative overflow-hidden`}
                        >
                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                            <div className="relative z-10">
                                <RadialGauge value={stat.value} max={stat.suffix === '%' ? 100 : stat.value * 1.3} color={stat.ring} />

                                <div className={`text-4xl sm:text-5xl font-display font-black ${stat.color} mb-2`}>
                                    {inView ? (
                                        <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} suffix={stat.suffix} enableScrollSpy={false} />
                                    ) : (
                                        <span>0{stat.suffix}</span>
                                    )}
                                </div>
                                <h3 className="text-white font-display font-bold text-sm tracking-wider mb-1">{stat.label}</h3>
                                <p className="text-slate-500 text-xs">{stat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

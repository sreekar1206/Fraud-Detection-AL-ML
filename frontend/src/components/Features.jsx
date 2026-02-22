import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiShieldCheck, HiCpuChip, HiBolt, HiGlobeAlt, HiFingerPrint, HiLockClosed } from 'react-icons/hi2'

const features = [
    {
        icon: HiShieldCheck,
        title: 'ENSEMBLE ML ENGINE',
        description: 'XGBoost + IsolationForest working in concert for a weighted hybrid risk score with 99.7% accuracy.',
        color: 'from-indigo-500 to-violet-600',
        neon: '#6366f1',
        link: '/detection',
    },
    {
        icon: HiCpuChip,
        title: 'SHAP EXPLAINABILITY',
        description: 'Human-readable XAI reasons for every prediction. Know exactly why a transaction was flagged.',
        color: 'from-violet-500 to-purple-600',
        neon: '#a855f7',
    },
    {
        icon: HiBolt,
        title: 'BEHAVIORAL ANALYSIS',
        description: 'Transaction velocity, impossible travel detection, and amount deviation analysis in real-time.',
        color: 'from-emerald-500 to-teal-600',
        neon: '#06d6a0',
    },
    {
        icon: HiGlobeAlt,
        title: 'VPN & IP INTELLIGENCE',
        description: 'Detect proxy/VPN usage, track IP traffic density, and identify suspicious network patterns.',
        color: 'from-cyan-500 to-blue-600',
        neon: '#38bdf8',
    },
    {
        icon: HiFingerPrint,
        title: 'DYNAMIC THRESHOLDS',
        description: 'Account age and trust score adjust detection sensitivity automatically per user profile.',
        color: 'from-pink-500 to-rose-600',
        neon: '#ec4899',
    },
    {
        icon: HiLockClosed,
        title: 'GRAPH CONTAGION',
        description: 'NetworkX-powered mule account detection flags transactions linked to known fraud networks.',
        color: 'from-amber-500 to-orange-600',
        neon: '#f59e0b',
    },
]

function Card3D({ feature, index }) {
    const cardRef = useRef(null)

    const handleMouseMove = (e) => {
        const card = cardRef.current
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -8
        const rotateY = ((x - centerX) / centerX) * 8
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'
    }

    const content = (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="glass rounded-2xl p-8 cursor-pointer transition-all duration-300 group holographic relative overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Neon border glow on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 30px ${feature.neon}15, 0 0 30px ${feature.neon}10` }} />

            {/* Icon */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 relative z-10`}
                style={{ boxShadow: `0 0 20px ${feature.neon}30` }}>
                <feature.icon className="text-2xl text-white" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-display font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors tracking-wider relative z-10">
                {feature.title}
            </h3>
            <p className="text-slate-400 leading-relaxed text-[15px] relative z-10">
                {feature.description}
            </p>

            {/* Animated bottom line */}
            <div className={`mt-6 h-0.5 w-0 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-700 rounded-full relative z-10`}
                style={{ boxShadow: `0 0 8px ${feature.neon}50` }} />
        </motion.div>
    )

    return feature.link ? <Link to={feature.link} className="block">{content}</Link> : content
}

export default function Features() {
    return (
        <section id="features" className="relative py-32 z-10">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-display font-bold text-indigo-400 tracking-[0.3em]">CAPABILITIES</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white mt-4 mb-6">
                        MULTI-LAYER{' '}
                        <span className="gradient-text">DEFENSE</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Six dimensions of intelligent fraud prevention, working in concert
                        to deliver enterprise-grade protection.
                    </p>
                </motion.div>

                {/* Feature Cards — 3D tilt */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <Card3D key={feature.title} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}

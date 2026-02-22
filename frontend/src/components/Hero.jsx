import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ─── Typewriter + Glitch text ─── */
function TypewriterGlitch({ words, className }) {
    const [index, setIndex] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [glitch, setGlitch] = useState(false)

    useEffect(() => {
        const word = words[index]
        const speed = isDeleting ? 40 : 80

        if (!isDeleting && displayed === word) {
            setTimeout(() => {
                setGlitch(true)
                setTimeout(() => { setGlitch(false); setIsDeleting(true) }, 200)
            }, 2000)
            return
        }
        if (isDeleting && displayed === '') {
            setIsDeleting(false)
            setIndex((prev) => (prev + 1) % words.length)
            return
        }

        const timer = setTimeout(() => {
            setDisplayed(isDeleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1))
        }, speed)
        return () => clearTimeout(timer)
    }, [displayed, isDeleting, index, words])

    return (
        <span className={`${className} ${glitch ? 'glitch' : ''}`} data-text={displayed}>
            {displayed}
            <span className="inline-block w-[3px] h-[1em] bg-indigo-400 ml-1 animate-pulse align-text-bottom" />
        </span>
    )
}

/* ─── Floating particles on hover ─── */
function ParticleBurst({ active }) {
    if (!active) return null
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
                <span
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        left: `${50 + (Math.random() - 0.5) * 60}%`,
                        top: `${50 + (Math.random() - 0.5) * 60}%`,
                        background: ['#6366f1', '#a855f7', '#06d6a0', '#38bdf8'][i % 4],
                        animation: `particle-rise ${0.6 + Math.random() * 0.4}s ease-out forwards`,
                        animationDelay: `${i * 0.03}s`,
                        boxShadow: `0 0 6px ${['#6366f1', '#a855f7', '#06d6a0', '#38bdf8'][i % 4]}`,
                    }}
                />
            ))}
        </div>
    )
}

export default function Hero() {
    const [burst, setBurst] = useState(false)

    const handleCTAClick = () => {
        setBurst(true)
        setTimeout(() => setBurst(false), 800)
    }

    const statItems = [
        { value: '99.7%', label: 'Accuracy', color: 'text-emerald-400' },
        { value: '<3ms', label: 'Latency', color: 'text-indigo-400' },
        { value: '24/7', label: 'Monitoring', color: 'text-purple-400' },
        { value: '0-Day', label: 'Threats Caught', color: 'text-cyan-400' },
    ]

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Aurora gradients */}
            <div className="absolute inset-0 z-[1]">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[150px] animate-aurora"
                    style={{ backgroundSize: '300% 300%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12), transparent)' }} />
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[130px] animate-aurora"
                    style={{ animationDelay: '2s', background: 'radial-gradient(ellipse, rgba(168,85,247,0.1), transparent)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-600/5 rounded-full blur-[160px] animate-aurora"
                    style={{ animationDelay: '4s', background: 'radial-gradient(ellipse, rgba(6,214,160,0.06), transparent)' }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    className="inline-flex items-center gap-3 glass-neon rounded-full px-6 py-2.5 mb-10"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_rgba(6,214,160,0.6)]" />
                    </span>
                    <span className="text-sm text-slate-300 font-semibold tracking-wider font-display">NEURAL ENGINE ACTIVE</span>
                </motion.div>

                {/* Headline with typewriter */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold leading-tight tracking-tight mb-8">
                        <span className="text-white block">AI-POWERED</span>
                        <span className="gradient-text glow-text block mt-2">
                            <TypewriterGlitch
                                words={['FRAUD DETECTION', 'RISK ANALYSIS', 'THREAT HUNTING', 'NEURAL DEFENSE']}
                                className="inline"
                            />
                        </span>
                    </h1>
                </motion.div>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
                >
                    Protect your financial ecosystem with <span className="text-white font-medium">ensemble machine learning</span>,{' '}
                    <span className="neon-text-cyan">behavioral analysis</span>, and{' '}
                    <span className="neon-text-purple">real-time threat intelligence</span>{' '}
                    — before attacks materialize.
                </motion.p>

                {/* CTA Buttons with particle burst */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5"
                >
                    <Link to="/detection" onClick={handleCTAClick}
                        className="btn-primary px-10 py-5 rounded-2xl text-white font-display font-bold text-lg tracking-wider inline-flex items-center gap-3 group relative">
                        <ParticleBurst active={burst} />
                        <span className="relative z-10">LAUNCH DETECTION</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <Link to="/dashboard"
                        className="btn-outline px-10 py-5 rounded-2xl text-slate-300 font-display font-semibold text-lg tracking-wider inline-flex items-center gap-3">
                        VIEW DASHBOARD
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </Link>
                </motion.div>

                {/* Stats ticker */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                    {statItems.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 + i * 0.1 }}
                            className="glass rounded-xl px-4 py-3 text-center group hover:glow-border transition-all duration-500"
                        >
                            <p className={`text-2xl font-display font-black ${stat.color} group-hover:animate-pulse-glow`}>{stat.value}</p>
                            <p className="text-slate-500 text-xs font-semibold tracking-wider mt-0.5">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-16 flex flex-col items-center gap-2"
                >
                    <span className="text-xs text-slate-600 font-display tracking-widest">SCROLL</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center p-1"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-1 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030014] to-transparent z-10" />
        </section>
    )
}

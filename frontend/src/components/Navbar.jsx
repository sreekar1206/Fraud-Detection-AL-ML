import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { HiShieldCheck } from 'react-icons/hi2'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Stats', href: '#stats' },
        { label: 'Architecture', href: '#architecture' },
    ]

    const pageLinks = [
        { label: 'Detection', to: '/detection' },
        { label: 'Forensics', to: '/forensics' },
        { label: 'Dashboard', to: '/dashboard' },
    ]

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'glass-strong shadow-neon' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo with 3D hover */}
                <Link to="/" className="flex items-center gap-3 group">
                    <motion.div
                        className="relative"
                        whileHover={{ rotateY: 360 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                        <HiShieldCheck className="text-3xl text-indigo-400 group-hover:text-indigo-300 transition-colors relative z-10" />
                        <div className="absolute inset-0 blur-xl bg-indigo-500/40 group-hover:bg-indigo-500/60 transition-all scale-150" />
                    </motion.div>
                    <span className="text-xl font-display font-bold tracking-wider">
                        <span className="text-white">FRAUD</span>
                        <span className="gradient-text">SHIELD</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {location.pathname === '/' && navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="relative px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-300 group font-medium"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 group-hover:w-3/4 transition-all duration-500 rounded-full shadow-neon" />
                        </a>
                    ))}
                    {pageLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 group ${location.pathname === link.to ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {link.label}
                            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ${location.pathname === link.to ? 'w-3/4 shadow-neon' : 'w-0 group-hover:w-3/4'
                                }`} />
                        </Link>
                    ))}
                    <Link
                        to="/detection"
                        className="btn-primary ml-4 text-sm px-6 py-2.5 rounded-xl font-semibold text-white font-display tracking-wider"
                    >
                        LAUNCH
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2 relative z-50"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <motion.span
                        animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                        className="w-6 h-0.5 bg-white block origin-center"
                    />
                    <motion.span
                        animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                        className="w-6 h-0.5 bg-white block"
                    />
                    <motion.span
                        animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                        className="w-6 h-0.5 bg-white block origin-center"
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-strong mx-4 mb-4 rounded-2xl p-6 flex flex-col gap-3 overflow-hidden"
                    >
                        {navLinks.map((link, i) => (
                            <motion.a
                                key={link.label}
                                href={link.href}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setMobileOpen(false)}
                                className="text-slate-300 hover:text-white transition-colors py-2 font-medium"
                            >
                                {link.label}
                            </motion.a>
                        ))}
                        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                        {pageLinks.map((link, i) => (
                            <motion.div
                                key={link.label}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: (navLinks.length + i) * 0.05 }}
                            >
                                <Link to={link.to} onClick={() => setMobileOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 block font-medium">
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                        <Link to="/detection" onClick={() => setMobileOpen(false)}
                            className="btn-primary text-center px-5 py-3 rounded-xl font-semibold text-white mt-2 font-display tracking-wider">
                            LAUNCH
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

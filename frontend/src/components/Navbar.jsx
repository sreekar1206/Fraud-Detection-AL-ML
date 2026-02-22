import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiShieldCheck } from 'react-icons/hi2'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Detection', href: '#detection' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Stats', href: '#stats' },
        { label: 'Architecture', href: '#architecture' },
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'glass-strong shadow-lg shadow-indigo-500/5'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <HiShieldCheck className="text-2xl text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                        <div className="absolute inset-0 blur-lg bg-indigo-500/30 group-hover:bg-indigo-500/50 transition-all" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        <span className="text-white">Fraud</span>
                        <span className="gradient-text">Shield</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm text-slate-400 hover:text-white transition-colors duration-300 relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}
                    <Link
                        to="/detection"
                        className="btn-primary text-sm px-5 py-2.5 rounded-xl font-medium text-white"
                    >
                        Try Detection
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass-strong mx-4 mb-4 rounded-2xl p-6 flex flex-col gap-4"
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-slate-300 hover:text-white transition-colors py-2"
                        >
                            {link.label}
                        </a>
                    ))}
                    <Link to="/detection" className="btn-primary text-center px-5 py-2.5 rounded-xl font-medium text-white mt-2">
                        Try Detection
                    </Link>
                </motion.div>
            )}
        </motion.nav>
    )
}

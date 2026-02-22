import { motion } from 'framer-motion'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { HiShieldCheck } from 'react-icons/hi2'

export default function Footer() {
    return (
        <footer className="relative z-10 pb-12 pt-0">
            {/* Electric divider */}
            <div className="max-w-4xl mx-auto mb-16 relative">
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-indigo-400 blur-sm" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                    >
                        <div className="relative">
                            <HiShieldCheck className="text-2xl text-indigo-400 relative z-10" />
                            <div className="absolute inset-0 blur-lg bg-indigo-500/30 scale-150" />
                        </div>
                        <span className="text-xl font-display font-bold tracking-wider">
                            <span className="text-white">FRAUD</span>
                            <span className="gradient-text">SHIELD</span>
                        </span>
                    </motion.div>

                    {/* Copyright */}
                    <p className="text-slate-500 text-sm font-display tracking-wider">
                        &copy; {new Date().getFullYear()} FRAUDSHIELD AI
                    </p>

                    {/* Social Icons with neon hover */}
                    <div className="flex items-center gap-3">
                        {[
                            { icon: FaGithub, href: '#', label: 'GitHub' },
                            { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
                            { icon: FaXTwitter, href: '#', label: 'X' },
                        ].map((social) => (
                            <motion.a
                                key={social.label}
                                href={social.href}
                                aria-label={social.label}
                                whileHover={{ scale: 1.2, y: -3 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:shadow-neon transition-all duration-300"
                            >
                                <social.icon className="text-lg" />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

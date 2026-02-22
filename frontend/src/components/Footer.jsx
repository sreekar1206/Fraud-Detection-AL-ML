import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { HiShieldCheck } from 'react-icons/hi2'

export default function Footer() {
    return (
        <footer className="relative z-10 pb-10 pt-0">
            {/* Gradient Divider */}
            <div className="max-w-4xl mx-auto mb-12">
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <HiShieldCheck className="text-xl text-indigo-400" />
                        <span className="text-lg font-bold tracking-tight">
                            <span className="text-white">Fraud</span>
                            <span className="gradient-text">Shield</span>
                        </span>
                    </div>

                    {/* Copyright */}
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} FraudShield AI. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        {[
                            { icon: FaGithub, href: '#', label: 'GitHub' },
                            { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
                            { icon: FaXTwitter, href: '#', label: 'X' },
                        ].map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                aria-label={social.label}
                                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                            >
                                <social.icon className="text-lg" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

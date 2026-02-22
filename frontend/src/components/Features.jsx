import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiShieldCheck, HiCpuChip, HiBolt } from 'react-icons/hi2'

const features = [
    {
        icon: HiShieldCheck,
        title: 'Real-Time Threat Detection',
        description: 'Monitor transactions in real-time with sub-millisecond latency. Our ML models analyze patterns and flag suspicious activity instantly.',
        color: 'from-indigo-500 to-violet-500',
        glowColor: 'group-hover:shadow-indigo-500/20',
    },
    {
        icon: HiCpuChip,
        title: 'Advanced ML Models',
        description: 'Ensemble of Random Forest, XGBoost, and Isolation Forest algorithms working in concert to maximize detection accuracy.',
        color: 'from-violet-500 to-purple-500',
        glowColor: 'group-hover:shadow-violet-500/20',
    },
    {
        icon: HiBolt,
        title: 'Automated Response',
        description: 'Instantly block fraudulent transactions, alert stakeholders, and trigger investigation workflows — all automated.',
        color: 'from-emerald-500 to-teal-500',
        glowColor: 'group-hover:shadow-emerald-500/20',
    },
]

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: i * 0.15,
            ease: 'easeOut',
        },
    }),
}

export default function Features() {
    return (
        <section id="features" className="relative py-32 z-10">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Features</span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-5">
                        Intelligent Protection at <span className="gradient-text">Every Layer</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Our multi-layered approach combines real-time analytics, machine learning, and automated response
                        to deliver enterprise-grade fraud prevention.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => {
                        const isDetection = feature.title === 'Real-Time Threat Detection';
                        
                        const cardContent = (
                            <>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="text-2xl text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-[15px]">
                                    {feature.description}
                                </p>

                                {/* Bottom accent line */}
                                <div className={`mt-6 h-0.5 w-0 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-500 rounded-full`} />
                            </>
                        );
                        
                        if (isDetection) {
                            return (
                                <motion.div
                                    key={feature.title}
                                    custom={i}
                                    variants={cardVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-60px' }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className={`group glass rounded-2xl p-8 cursor-pointer transition-shadow duration-500 ${feature.glowColor} hover:shadow-2xl glow-border`}
                                >
                                    <Link to="/detection" className="block">
                                        {cardContent}
                                    </Link>
                                </motion.div>
                            );
                        }
                        
                        return (
                            <motion.div
                                key={feature.title}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className={`group glass rounded-2xl p-8 cursor-pointer transition-shadow duration-500 ${feature.glowColor} hover:shadow-2xl glow-border`}
                            >
                                {cardContent}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}

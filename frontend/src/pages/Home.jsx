import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Stats from '../components/Stats'
import Architecture from '../components/Architecture'
import Footer from '../components/Footer'

export default function Home() {
    return (
        <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#030014' }}>
            {/* 3D Background */}
            <Background3D />

            {/* Content */}
            <div className="relative z-10">
                <Navbar />
                <Hero />
                <Features />
                <HowItWorks />
                <Stats />
                <Architecture />
                <Footer />
            </div>
        </div>
    )
}

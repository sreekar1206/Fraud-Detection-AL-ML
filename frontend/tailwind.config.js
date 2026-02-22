/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef7ff', 100: '#d9edff', 200: '#bce0ff',
                    300: '#8eccff', 400: '#59b0ff', 500: '#3b8eff',
                    600: '#1e6bf5', 700: '#1755e1', 800: '#1945b6',
                    900: '#1a3d8f', 950: '#152757',
                },
                accent: {
                    cyan: '#06d6a0',
                    violet: '#8b5cf6',
                    indigo: '#6366f1',
                    rose: '#f43f5e',
                    purple: '#a855f7',
                    sky: '#38bdf8',
                    emerald: '#10b981',
                    amber: '#f59e0b',
                },
                dark: {
                    950: '#030014',
                    900: '#0a0a1a',
                    800: '#0d0d1f',
                    700: '#121228',
                    600: '#1a1a35',
                    500: '#222245',
                },
                neon: {
                    blue: '#4f46e5',
                    purple: '#a855f7',
                    cyan: '#06d6a0',
                    pink: '#ec4899',
                    sky: '#38bdf8',
                },
            },
            fontFamily: {
                sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Orbitron', 'Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out infinite 2s',
                'float-slow': 'float 8s ease-in-out infinite',
                'pulse-glow': 'neon-pulse 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 6s ease infinite',
                'spin-slow': 'spin 20s linear infinite',
                'spin-reverse': 'spin 15s linear infinite reverse',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'holographic': 'holographic-shimmer 3s ease-in-out infinite',
                'aurora': 'aurora 8s ease-in-out infinite',
                'data-flow': 'data-flow 3s linear infinite',
                'particle-rise': 'particle-rise 1s ease-out forwards',
                'pulse-ring': 'pulse-ring 2s ease-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '33%': { transform: 'translateY(-10px) rotate(1deg)' },
                    '66%': { transform: 'translateY(5px) rotate(-1deg)' },
                },
                'neon-pulse': {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.85', filter: 'brightness(1.3)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backgroundSize: {
                '300%': '300% 300%',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)',
                'neon-lg': '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.15)',
                'neon-cyan': '0 0 20px rgba(6, 214, 160, 0.3), 0 0 40px rgba(6, 214, 160, 0.1)',
                'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)',
            },
        },
    },
    plugins: [],
}

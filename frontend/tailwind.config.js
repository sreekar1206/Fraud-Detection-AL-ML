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
                    50: '#eef7ff',
                    100: '#d9edff',
                    200: '#bce0ff',
                    300: '#8eccff',
                    400: '#59b0ff',
                    500: '#3b8eff',
                    600: '#1e6bf5',
                    700: '#1755e1',
                    800: '#1945b6',
                    900: '#1a3d8f',
                    950: '#152757',
                },
                accent: {
                    cyan: '#06d6a0',
                    violet: '#8b5cf6',
                    indigo: '#6366f1',
                    rose: '#f43f5e',
                },
                dark: {
                    900: '#0a0a0f',
                    800: '#0d0d14',
                    700: '#12121c',
                    600: '#1a1a2e',
                    500: '#22223a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 8s ease infinite',
                'spin-slow': 'spin 20s linear infinite',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
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
        },
    },
    plugins: [],
}

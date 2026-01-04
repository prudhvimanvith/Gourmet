/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary: Orange
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c', // Main Brand
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // Semantic Colors
                success: '#10b981', // Neon Green-ish
                warning: '#f59e0b', // Amber
                critical: '#ef4444', // Red

                // Light Mode Greys/Whites
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0', // Borders
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b', // Subtext
                    800: '#1e293b', // Dark text
                    900: '#0f172a', // Headings
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
                'neon': '0 0 10px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3)',
            }
        },
    },
    plugins: [],
}

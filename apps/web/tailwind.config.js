/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'var(--border-color)',
                input: 'var(--border-color)',
                ring: 'var(--accent-primary)',
                background: 'var(--bg-primary)',
                foreground: 'var(--text-primary)',
                primary: {
                    DEFAULT: 'var(--accent-primary)',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: 'var(--bg-secondary)',
                    foreground: 'var(--text-primary)',
                },
                destructive: {
                    DEFAULT: 'var(--danger)',
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: 'var(--bg-secondary)',
                    foreground: 'var(--text-secondary)',
                },
                accent: {
                    DEFAULT: 'var(--accent-secondary)',
                    foreground: '#ffffff',
                },
                popover: {
                    DEFAULT: 'var(--bg-card)',
                    foreground: 'var(--text-primary)',
                },
                card: {
                    DEFAULT: 'var(--bg-card)',
                    foreground: 'var(--text-primary)',
                },
                // Manual theme fallbacks
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                'bg-primary': 'var(--bg-primary)', // For backward compat if needed
                'bg-secondary': 'var(--bg-secondary)',
                'bg-card': 'var(--bg-card)',
            },
            borderRadius: {
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
            },
            fontFamily: {
                'sans': 'var(--font-sans)',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
    darkMode: 'class',
}

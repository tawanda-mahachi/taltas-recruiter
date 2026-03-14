import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['Roboto Mono', 'Courier New', 'Lucida Console', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        taltas: {
          bg: '#f4f5f7',
          surface: '#ffffff',
          'surface-2': '#f8f9fb',
          'surface-3': '#eef0f3',
          border: '#e2e5ea',
          'border-2': '#cdd1d9',
          muted: '#9aa0ad',
          'text-dim': '#6b7280',
          'text-mid': '#374151',
          text: '#1f2937',
          'text-bright': '#0f172a',
        },
      },
      borderRadius: {
        card: '12px',
        input: '9px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,.08)',
        topbar: '0 1px 3px rgba(0,0,0,.07)',
        'auth-card': '0 4px 6px rgba(0,0,0,.04), 0 20px 60px rgba(37,99,235,.08)',
        'auth-btn': '0 2px 8px rgba(37,99,235,.3)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.5s infinite',
        'fade-up': 'fade-up 0.3s ease both',
      },
    },
  },
  plugins: [],
};

export default config;

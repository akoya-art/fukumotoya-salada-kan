import type { Config } from 'tailwindcss'

const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: withAlpha('--bg'),
        surface: withAlpha('--surface'),
        'surface-2': withAlpha('--surface-2'),
        line: withAlpha('--border'),
        ink: withAlpha('--text'),
        muted: withAlpha('--text-muted'),
        subtle: withAlpha('--text-subtle'),
        primary: {
          DEFAULT: withAlpha('--primary'),
          fg: withAlpha('--primary-fg'),
          soft: withAlpha('--primary-soft'),
        },
        accent: withAlpha('--accent'),
        // semantic status
        success: { DEFAULT: withAlpha('--success'), soft: withAlpha('--success-soft'), fg: withAlpha('--success-fg'), solid: withAlpha('--success-solid') },
        warning: { DEFAULT: withAlpha('--warning'), soft: withAlpha('--warning-soft'), fg: withAlpha('--warning-fg') },
        info: { DEFAULT: withAlpha('--info'), soft: withAlpha('--info-soft'), fg: withAlpha('--info-fg') },
        // domain accents (request types)
        transfer: { DEFAULT: withAlpha('--transfer'), soft: withAlpha('--transfer-soft'), fg: withAlpha('--transfer-fg') },
        external: { DEFAULT: withAlpha('--external'), soft: withAlpha('--external-soft'), fg: withAlpha('--external-fg') },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"Yu Gothic UI"',
          'Meiryo',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(var(--shadow-color) / 0.05)',
        sm: '0 1px 3px 0 rgb(var(--shadow-color) / 0.08), 0 1px 2px -1px rgb(var(--shadow-color) / 0.06)',
        card: '0 1px 2px rgb(var(--shadow-color) / 0.04), 0 4px 16px -4px rgb(var(--shadow-color) / 0.08)',
        lift: '0 4px 8px -2px rgb(var(--shadow-color) / 0.08), 0 12px 32px -8px rgb(var(--shadow-color) / 0.16)',
        pop: '0 8px 24px -6px rgb(var(--shadow-color) / 0.18), 0 24px 56px -16px rgb(var(--shadow-color) / 0.28)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
} satisfies Config

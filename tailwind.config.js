/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        tealbrand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Division Colors (Aesthetic & Eye-pleasing, non-oversaturated)
        div: {
          sdma: {
            DEFAULT: '#6366f1',
            light: '#eef2ff',
            border: '#c7d2fe',
            text: '#4338ca',
          },
          tk: {
            DEFAULT: '#f43f5e',
            light: '#fff1f2',
            border: '#fecdd3',
            text: '#be123c',
          },
          sdm: {
            DEFAULT: '#10b981',
            light: '#ecfdf5',
            border: '#a7f3d0',
            text: '#047857',
          },
          quran: {
            DEFAULT: '#06b6d4',
            light: '#ecfeff',
            border: '#a5f3fc',
            text: '#0e7490',
          },
          sarpras: {
            DEFAULT: '#f59e0b',
            light: '#fffbeb',
            border: '#fde68a',
            text: '#b45309',
          },
          bilingual: {
            DEFAULT: '#8b5cf6',
            light: '#f5f3ff',
            border: '#ddd6fe',
            text: '#6d28d9',
          },
          media: {
            DEFAULT: '#f97316',
            light: '#fff7ed',
            border: '#fed7aa',
            text: '#c2410c',
          },
          it: {
            DEFAULT: '#0ea5e9',
            light: '#f0f9ff',
            border: '#bae6fd',
            text: '#0369a1',
          },
        },
        navy: {
          900: '#0a1128',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
          400: '#64748b',
        },
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        },
        status: {
          completed: '#10b981',
          'completed-bg': '#ecfdf5',
          progress: '#3b82f6',
          'progress-bg': '#eff6ff',
          pending: '#f59e0b',
          'pending-bg': '#fffbeb',
          delayed: '#f43f5e',
          'delayed-bg': '#fff1f2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        'medium': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'tv': '0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}


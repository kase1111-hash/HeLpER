/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Earth Tone Palette
        earth: {
          // Backgrounds - deep warm browns
          950: '#12100D',  // Deepest - window frame
          900: '#1A1612',  // Deep background
          800: '#242019',  // Main background
          700: '#2E2820',  // Elevated surface
          600: '#3A3228',  // Cards/panels
          500: '#4A4035',  // Hover states
          // Accents - warm muted tones
          400: '#5C5043',  // Borders
          300: '#7A6B58',  // Tertiary text
          200: '#A69580',  // Secondary text
          100: '#C4B5A0',  // Primary text
          50:  '#E8DFD0',  // Highlights/headings
        },
        // Accent colors
        accent: {
          DEFAULT: '#C9A227',    // Rich gold - primary
          light: '#E0B830',      // Light gold - hover
          muted: '#9A7B4F',      // Muted bronze
          warm: '#B8860B',       // Dark goldenrod
          copper: '#B87333',     // Copper
          sage: '#7D8B6A',       // Sage green
          moss: '#5A6B4A',       // Moss green
          olive: '#6B7355',      // Olive
          clay: '#A67B5B',       // Clay
          rust: '#8B5A3C',       // Rust
        },
        // Semantic colors (earth-friendly)
        success: '#7D8B6A',      // Sage
        warning: '#C9A227',      // Gold
        error: '#A65D57',        // Muted terracotta
        info: '#9A7B4F',         // Bronze
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'sans-serif'
        ],
      },
      fontSize: {
        'app-title': ['14px', { fontWeight: '600', letterSpacing: '0.05em' }],
        'date-header': ['15px', { fontWeight: '500', letterSpacing: '0.02em' }],
        'note-title': ['13px', { fontWeight: '500' }],
        'note-body': ['14px', { fontWeight: '400', lineHeight: '1.65' }],
        'chat-message': ['13px', { fontWeight: '400', lineHeight: '1.5' }],
        'status-bar': ['11px', { fontWeight: '500', letterSpacing: '0.03em', textTransform: 'uppercase' }],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(201, 162, 39, 0.15)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
        'elevated': '0 8px 24px -8px rgba(0, 0, 0, 0.5)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'sleek': '8px',
        'pill': '9999px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

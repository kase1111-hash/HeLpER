/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        light: {
          bg: '#FFFFFF',
          surface: '#F5F5F5',
          primary: '#4A90D9',
          text: '#1A1A1A',
          'text-secondary': '#666666',
          border: '#E0E0E0',
        },
        // Dark mode
        dark: {
          bg: '#1E1E1E',
          surface: '#2D2D2D',
          primary: '#5BA0E9',
          text: '#E5E5E5',
          'text-secondary': '#A0A0A0',
          border: '#404040',
        },
        // Semantic colors
        success: {
          light: '#34C759',
          dark: '#30D158',
        },
        warning: {
          light: '#FF9500',
          dark: '#FFD60A',
        },
        error: {
          light: '#FF3B30',
          dark: '#FF453A',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'app-title': ['14px', { fontWeight: '600' }],
        'date-header': ['16px', { fontWeight: '500' }],
        'note-title': ['14px', { fontWeight: '500' }],
        'note-body': ['14px', { fontWeight: '400' }],
        'chat-message': ['13px', { fontWeight: '400' }],
        'status-bar': ['12px', { fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

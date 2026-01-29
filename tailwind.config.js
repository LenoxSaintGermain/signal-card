/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#020617',
        'holo-cyan': '#06b6d4',
        'system-amber': '#f59e0b',
        'phantom-slate': '#1e293b',
        'signal-white': '#ffffff',
      },
      fontFamily: {
        'display': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}

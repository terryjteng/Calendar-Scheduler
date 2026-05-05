import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a2035',
        'sidebar-hover': '#232d47',
        'sidebar-active': '#2a3454',
        'sidebar-border': '#2e3a57',
        // Project accent colors
        'general-purple': '#7c3aed',
        'lastlight-teal': '#0d9488',
        'corebound-blue': '#2563eb',
        'bigboss-amber': '#d97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

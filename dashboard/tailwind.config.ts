import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optalis Healthcare Brand Colors
        primary: {
          DEFAULT: '#275380',
          dark: '#1e3f61',
          light: '#4c94d6',
        },
        accent: {
          DEFAULT: '#3a7ca5',
          light: '#5a9cc5',
          dark: '#275380',
        },
        sage: {
          DEFAULT: '#8fa89a',
          light: '#b8ccc0',
        },
        cream: '#f9f7f4',
        'warm-white': '#fdfcfa',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0,0,0,0.04)',
        'soft-md': '0 4px 24px rgba(0,0,0,0.06)',
        'soft-lg': '0 12px 48px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
export default config;

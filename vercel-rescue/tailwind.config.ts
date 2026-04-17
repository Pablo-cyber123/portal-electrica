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
        background: "var(--background)",
        foreground: "var(--foreground)",
        utsGreen: {
          50: '#f5f8e8',
          100: '#eaf1cf',
          200: '#d9e6a5',
          300: '#c3d730', // Color institucional Pantone 382 C
          400: '#a8be2a',
          500: '#8da524',
          600: '#728a1e',
          700: '#566818',
          800: '#3f4c14',
          900: '#2a3310',
          950: '#1a1f0a',
        },
        vinotinto: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a8ba',
          400: '#ec7694',
          500: '#df4770',
          600: '#c8275a',
          700: '#a31d4a',
          800: '#7b1a3c', // Color vinotinto UTS institucional
          900: '#6a1a36',
          950: '#3d0919',
        },
        oxfordGrey: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b3b3b3', // Cool Gray 5 C
          400: '#878787', // Pantone 877 C
          500: '#6b6b6b',
          600: '#555558',
          700: '#36393e',
          800: '#282b30',
          900: '#1e2124',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      }
    },
  },
  plugins: [],
};
export default config;

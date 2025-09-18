/*eslint-env node*/
import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      zIndex: {
        '1': '1',   
        '2': '2',   
        '3': '3',   
        '4': '4',   
        '5': '5',   
        infinity: "10000000", 
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 8px)",
        lg: "calc(var(--radius) + 4px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'gradient-x': {
          '0%': {
            'background-position': '200% 0',
          },
          '100%': {
            'background-position': '-200% 0',
          },
        },
      },
      backgroundSize: {
        'auto-200': '200% auto',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "overlayShow": 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        "contentShow": 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'gradient-x': 'gradient-x 3s linear infinite',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function({ addUtilities }) {
      const newUtilities = {
        '.animated-loading-bar': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '2px',
            backgroundImage: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
            backgroundSize: '200% 100%',
            animation: 'gradient-x 3s linear infinite',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}
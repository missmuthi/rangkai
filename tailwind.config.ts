import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        // ============================================
        // 1. Custom Color Palette
        // ============================================
        'molten-lava': {
          DEFAULT: '#780000',
          50: '#ffb1b1',
          100: '#ff6464',
          200: '#ff1616',
          300: '#c80000',
          400: '#780000',
          500: '#780000',
          600: '#620000',
          700: '#490000',
          800: '#310000',
          900: '#180000',
        },
        'brick-red': {
          DEFAULT: '#c1121f',
          50: '#fac8cb',
          100: '#f59198',
          200: '#f05a64',
          300: '#eb2330',
          400: '#c1121f',
          500: '#c1121f',
          600: '#990e17',
          700: '#730b12',
          800: '#4d070c',
          900: '#260406',
        },
        'papaya-whip': {
          DEFAULT: '#fdf0d5',
          50: '#fffcf6',
          100: '#fef9ed',
          200: '#fef5e5',
          300: '#fdf2dc',
          400: '#fdf0d5',
          500: '#fdf0d5',
          600: '#f9cf7b',
          700: '#f5ae22',
          800: '#b17908',
          900: '#593c04',
        },
        'deep-space-blue': {
          DEFAULT: '#003049',
          50: '#a7e0ff',
          100: '#50c2ff',
          200: '#00a0f7',
          300: '#00679f',
          400: '#003049',
          500: '#003049',
          600: '#002539',
          700: '#001c2b',
          800: '#00131d',
          900: '#00090e',
        },
        'steel-blue': {
          DEFAULT: '#669bbc',
          50: '#e1ebf2',
          100: '#c2d7e4',
          200: '#a4c3d7',
          300: '#85afc9',
          400: '#669bbc',
          500: '#669bbc',
          600: '#477fa2',
          700: '#355f79',
          800: '#233f51',
          900: '#122028',
        },

        // ============================================
        // 2. Semantic Mapping (Shadcn CSS Variables)
        // ============================================
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config

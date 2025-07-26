/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors using our CSS variables
        'brand-primary': 'var(--primary-color)',
        'brand-primary-hover': 'var(--primary-hover)',
        'brand-secondary': 'var(--secondary-color)',
        'brand-secondary-hover': 'var(--secondary-hover)',
        
        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-light)',
        'text-inverse': '#ffffff',
        
        // Background colors
        'bg-primary': 'var(--background-primary)',
        'bg-secondary': 'var(--background-secondary)',
        'bg-muted': 'var(--background-muted)',
        
        // Border colors
        'border-primary': 'var(--border-color)',
        'border-light': 'var(--border-light)',
        
        // Status colors
        'success': 'var(--success-color)',
        'warning': 'var(--warning-color)',
        'error': 'var(--error-color)',
      },
      fontFamily: {
        'sans': ['var(--font-family)'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        'DEFAULT': 'var(--border-radius)',
        'lg': 'var(--border-radius-lg)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
} 
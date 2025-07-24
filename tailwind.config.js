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
        // Brand Colors
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-primary-light': 'var(--brand-primary-light)',
        'brand-primary-dark': 'var(--brand-primary-dark)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-secondary-hover': 'var(--brand-secondary-hover)',
        'brand-secondary-light': 'var(--brand-secondary-light)',
        'brand-secondary-dark': 'var(--brand-secondary-dark)',
        
        // Text Colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        'text-success': 'var(--text-success)',
        'text-warning': 'var(--text-warning)',
        'text-error': 'var(--text-error)',
        'text-info': 'var(--text-info)',
        
        // Background Colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-muted': 'var(--bg-muted)',
        'bg-inverse': 'var(--bg-inverse)',
        'bg-success': 'var(--bg-success)',
        'bg-warning': 'var(--bg-warning)',
        'bg-error': 'var(--bg-error)',
        'bg-info': 'var(--bg-info)',
        
        // Border Colors
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-muted': 'var(--border-muted)',
        'border-success': 'var(--border-success)',
        'border-warning': 'var(--border-warning)',
        'border-error': 'var(--border-error)',
        'border-info': 'var(--border-info)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} 
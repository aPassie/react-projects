/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
          },
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
          }
        },
        keyframes: {
          'fade-in': {
            '0%': { 
              opacity: '0',
              transform: 'translateY(-10px)'
            },
            '100%': { 
              opacity: '1',
              transform: 'translateY(0)'
            },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          blob: {
            '0%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
            '33%': {
              transform: 'translate(30px, -50px) scale(1.1)',
            },
            '66%': {
              transform: 'translate(-20px, 20px) scale(0.9)',
            },
            '100%': {
              transform: 'translate(0px, 0px) scale(1)',
            },
          },
        },
        animation: {
          'fade-in': 'fade-in 0.2s ease-out',
          float: 'float 6s ease-in-out infinite',
          blob: 'blob 7s infinite',
        },
        typography: (theme) => ({
          invert: {
            css: {
              '--tw-prose-body': theme('colors.neutral[300]'),
              '--tw-prose-headings': theme('colors.white'),
              '--tw-prose-links': theme('colors.blue[400]'),
              '--tw-prose-links-hover': theme('colors.blue[300]'),
              '--tw-prose-underline': theme('colors.blue[400]/40'),
              '--tw-prose-underline-hover': theme('colors.blue[400]'),
              '--tw-prose-bold': theme('colors.white'),
              '--tw-prose-counters': theme('colors.neutral[400]'),
              '--tw-prose-bullets': theme('colors.neutral[600]'),
              '--tw-prose-hr': theme('colors.neutral[700]'),
              '--tw-prose-quote-borders': theme('colors.neutral[700]'),
              '--tw-prose-captions': theme('colors.neutral[400]'),
              '--tw-prose-code': theme('colors.white'),
              '--tw-prose-pre-code': theme('colors.neutral[300]'),
              '--tw-prose-pre-bg': 'rgb(0 0 0 / 50%)',
              '--tw-prose-th-borders': theme('colors.neutral[600]'),
              '--tw-prose-td-borders': theme('colors.neutral[700]'),
            },
          },
        }),
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
    
  }
  
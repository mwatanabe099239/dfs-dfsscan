/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          green: {
            50: '#f0fef1',
            100: '#d9feda',
            200: '#b5fdb8',
            300: '#7afb80',
            400: '#42f34c',
            500: '#21f201',
            600: '#1bd301',
            700: '#17a601',
            800: '#178306',
            900: '#156b0a',
          },
        },
        container: {
          screens: {
            sm: '640px ',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
          },
        },
      },
    },
    plugins: [],
  }
  
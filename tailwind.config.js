/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#008751', // Nigerian Green (Updated for Brand)
        'primary-dark': '#00643b',
        accent: '#FCD116',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        charcoal: '#222222',
        energyLime: '#A7E34B',
        softGray: '#F5F6F7',
        slateGray: '#5E6E64',
        electricBlue: '#009FE3'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
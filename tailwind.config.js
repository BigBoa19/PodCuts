/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", ],
  theme: {
    extend: {
      colors: {
        primary: '#735DA5',
        secondary: '#D3C5E5',
        tertiary: '#2e2a72',
        quaternary: '#b35ad6',
      },
      fontFamily: {
        poppinsBlack: ['Poppins-Black', 'sans-serif'],
        poppinsThin: ['Poppins-Thin', 'sans-serif'],
        poppinsRegular: ['Poppins-Regular', 'sans-serif'],
        poppinsMedium: ['Poppins-Medium', 'sans-serif'],
        poppinsSemiBold: ['Poppins-SemiBold', 'sans-serif'],
        poppinsBold: ['Poppins-Bold', 'sans-serif'],
        poppinsExtraBold: ['Poppins-ExtraBold', 'sans-serif'],
        poppinsLight: ['Poppins-Light', 'sans-serif'],
        poppinsExtraLight: ['Poppins-ExtraLight', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


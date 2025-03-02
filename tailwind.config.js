/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/**/**/*.{js,ts,jsx,tsx}",
    "./src/Components/**/**/**/**/*.{js,ts,jsx,tsx}",
    "./src/Util/**/*.{js,ts,jsx,tsx}",
    "./src/Util/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f0fdf4",
        primary: "#00A63E",
        secondary: "#f0fdf4",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add any other paths to your templates here
  ],
  theme: {
    extend: {
      scrollbar: {
        DEFAULT: {
          thumb: "rounded-lg bg-gray-400",
          track: "bg-transparent",
        },
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};

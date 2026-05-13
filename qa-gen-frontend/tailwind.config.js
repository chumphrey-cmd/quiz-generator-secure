/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Map our CSS variables to Tailwind color classes
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        page: "var(--page-bg)",
        container: "var(--container-bg)",
        textMain: "var(--text-primary)",
        textSub: "var(--text-secondary)",
        mainBorder: "var(--main-border)",
        inputFocus: "var(--input-focus)",
      },
      // Custom box shadows
      boxShadow: {
        'brutal': '4px 4px 0px 0px var(--text-primary)', // Hard solid shadow
        'brutal-sm': '2px 2px 0px 0px var(--text-primary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
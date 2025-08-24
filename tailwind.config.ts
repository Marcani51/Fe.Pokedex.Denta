import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}", // sesuaikan dengan frameworkmu
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config

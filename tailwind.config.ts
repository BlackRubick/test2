import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4F1EB',
        'paper-dim': '#EAE6DC',
        ink: '#14130F',
        'ink-soft': '#3A382F',
        stone: '#A9A79E',
        'stone-light': '#D8D5CA',
        clay: '#A85B34',
        'clay-dim': '#C98B67'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif']
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.24em'
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
}

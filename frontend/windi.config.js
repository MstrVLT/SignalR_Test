import { defineConfig } from 'windicss/helpers'

export default defineConfig({
    darkMode: 'media',
    extract: {
        include: ['src/**/*.{vue,html}'],
        exclude: ['node_modules', '.git'],
    },
})

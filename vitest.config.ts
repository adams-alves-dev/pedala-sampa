import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    include: ['tests/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'composables/**/*.ts', 'components/**/*.vue'],
    },
  },
})

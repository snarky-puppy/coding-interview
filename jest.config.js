/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/tests/**/*.test.(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'backend/**/*.ts',
    'frontend/**/*.tsx',
    '!**/node_modules/**',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

module.exports = config;
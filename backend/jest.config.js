/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  // Target 90% as we add more tests; current coverage ~83% statements.
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 85,
      lines: 85,
      statements: 80,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
};

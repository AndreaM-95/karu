import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/main.ts',
    '!**/dist/**',
    '!**/dto/**',
    '!**/interfaces/**',
    '!**/migrations/**',
    '!**/entities/**',
  ],
  coverageDirectory: './coverage',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
};

export default config;

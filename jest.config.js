/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@common/(.*)': '<rootDir>/src/common/$1',
    '@routes/(.*)': '<rootDir>/src/routes/$1',
    '@database/(.*)': '<rootDir>/src/database/$1',
    '@components/(.*)': '<rootDir>/src/components/$1',
    '@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '@validators/(.*)': '<rootDir>/src/validators/$1',
    '@logger/(.*)': '<rootDir>/src/logger/$1',
    '@authenticator/(.*)': '<rootDir>/src/authenticator/$1',
  },
};

// Jest config — uses jest-expo preset and maps the @/ alias to the project root
module.exports = {
  preset: 'jest-expo',
  // Extend expect with React Native Testing Library matchers
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  // Resolve @/ imports to the project root
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
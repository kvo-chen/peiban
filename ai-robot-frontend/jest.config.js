export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\.(css|less|sass|scss)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        types: ['vite/client', 'jest', 'node'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: false,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        esModuleInterop: true
      }
    }]
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.tsx',
    '!src/main.tsx',
    '!src/**/*.d.ts',
    '!src/**/types/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};

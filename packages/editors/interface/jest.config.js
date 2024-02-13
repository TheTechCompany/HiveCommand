/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    // // "\\.[jt]sx?$": "babel-jest",
    // "\\.css$": "<rootDir>/src/transform.js",
    // // "^.+\\.(css|scss|sass|less)$": "jest-preview/transforms/css",
    // "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)": "jest-preview/transforms/file",
  },
  "transformIgnorePatterns": [
    "/node_modules/"
  ],
  moduleNameMapper: {
    '^monaco-editor$': '<rootDir>/../../../node_modules/monaco-editor/esm/vs/editor/editor.api.js',
    '^nanoid$': '<rootDir>/../../../node_modules/nanoid/index.cjs',
    '^d3$': '<rootDir>/../../../node_modules/d3/dist/d3.min.js',
    '^d3-drag$': '<rootDir>/../../../node_modules/d3-drag/dist/d3-drag.min.js',
    '^d3-dispatch$': '<rootDir>/../../../node_modules/d3-dispatch/dist/d3-dispatch.min.js',
    '^d3-selection$': '<rootDir>/../../../node_modules/d3-selection/dist/d3-selection.min.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

};
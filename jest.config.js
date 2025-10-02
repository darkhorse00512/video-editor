module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    // Handle module aliases
    "^@/(.*)$": "<rootDir>/$1",
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/tests/mocks/styleMock.js",
    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$":
      "<rootDir>/tests/mocks/fileMock.js",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  roots: ["<rootDir>/tests", "<rootDir>/components", "<rootDir>/app"],
};

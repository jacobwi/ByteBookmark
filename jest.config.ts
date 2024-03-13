import type { Config } from '@jest/types';
import baseConfig from '../jest.config'; // Adjust the path as necessary

const chromeExtensionConfig: Config.InitialOptions = {
  ...baseConfig,

  setupFilesAfterEnv: ['../jest.setup.ts'], // Ensure this points to the setup file within the chrome-extension directory
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',

    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
  },
  rootDir: './',
};

export default chromeExtensionConfig;

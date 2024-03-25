"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                diagnostics: {
                    ignoreCodes: [1343],
                },
                tsconfig: "tsconfig.json",
                useESM: true,
            },
        ],
        "^.+\\.js?$": "babel-jest",
        "^.+\\.jsx?$": "babel-jest",
        // process `*.tsx` files with `ts-jest`
    },
    rootDir: "./",
    coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
    // Configure to match your project structure
    moduleFileExtensions: [
        "tsx",
        "ts",
        "web.js",
        "js",
        "web.ts",
        "web.tsx",
        "json",
        "web.jsx",
        "jsx",
        "node",
    ],
    moduleDirectories: ["node_modules", "src"],
    setupFilesAfterEnv: ["./jest.setup.ts"], // Optional, for global test setup
};
exports.default = config;

const config = {
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    setupFilesAfterEnv: [
        'jest-extended'
    ],
    testRegex: '((\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    testPathIgnorePatterns: [
        'systemTests'
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: -10
        }
    }
};

export default config;
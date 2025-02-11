module.exports =  {
    allowConsoleColors: true,
    buildCommand: 'npm run build',
    checkers: ['typescript'],
    coverageAnalysis: "perTest",
    packageManager: "npm",
    reporters: ["html", "progress", "json"],
    testRunner: "jest",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/**/*.ts"],
    thresholds: { high: 90, low: 80, break: 80 },
    ignorePatterns: ["**", "!src/**/*.ts", "!tests/**/*.ts"]
};

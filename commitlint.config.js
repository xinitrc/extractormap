module.exports = {
    extends: ['@commitlint/config-angular'],
    rules: {
        'header-max-length': [0, 'always'],
        'subject-max-length': [2, 'always', 72],
        'body-case': [2, 'always', 'lower-case'],
        'type-enum': [
            2,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
            ]
        ]
    }
};
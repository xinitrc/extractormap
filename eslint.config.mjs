// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
    {
        plugins: {
            '@stylistic': stylistic
        },
        files: [
            'src/**/*.ts',
            'tests/**/*.ts'
        ],
        ignores: ['**/lib/**', 'stryker.*.js'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                allowDefaultProject: ['tests/**/*.ts']
            },
        },
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/array-type': 'off',
            'sort-imports': 'off',
            'sort-keys': 'off',
            'no-multiple-empty-lines': 'error'
        }
    },
    {
        rules: {
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/comma-dangle': ['error', 'never'],
        }
    },
    {
        rules: {
            'complexity': ['error', 5],
        }
    }
);


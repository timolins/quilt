module.exports = {
  extends: [
    'plugin:shopify/typescript',
    'plugin:shopify/react',
    'plugin:shopify/jest',
    'plugin:shopify/prettier',
  ],
  root: true,
  parserOptions: {
    project: 'tsconfig.json',
  },
  rules: {
    'import/extensions': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'node/no-extraneous-require': 'off',
    'import/no-cycle': 'off',
    'jest/require-tothrow-message': 'off',
    'callback-return': 'off',
    'jest/no-if': 'off',
    'import/named': 'off',
    'func-style': 'off',
    'react/display-name': 'off',
    'shopify/restrict-full-import': ['error', 'lodash'],
    'shopify/jsx-no-hardcoded-content': 'off',
    'shopify/jest/no-vague-titles': [
      'error',
      {
        allow: ['all'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: {
        rules: {'shopify/jsx-no-hardcoded-content': 'off'},
      },
    },
    {
      files: ['packages/@shopify/react-server-webpack-plugin/**/*'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
            optionalDependencies: true,
            peerDependencies: true,
            packageDir: ['./packages/@shopify/react-server-webpack-plugin/'],
          },
        ],
      },
    },
  ],
  settings: {
    'import/external-module-folders': ['packages', 'node_modules'],
  },
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'only-warn'],
  rules: {
    'object-shorthand': 0,
    'no-undef': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'react/require-default-props': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-no-bind': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/jsx-fragments': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'linebreak-style': 0,
    'no-use-before-define': 'off',
    'import/no-named-default': 'off',
    'arrow-body-style': 'off',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
  },
  settings: {
    react: {
      version: 'latest',
    },
  },
}

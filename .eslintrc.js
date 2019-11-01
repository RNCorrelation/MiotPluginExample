module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "env": {
    "browser": true
  },
  "globals": {
    "__DEV__": true
  },
  "rules": {
    "react/jsx-filename-extension": [
      1,
      {
        "extensions": [
          ".js",
          ".jsx"
        ]
      }
    ],
    "react/prefer-stateless-function": [
      0,
      {
        "ignorePureComponents": true
      }
    ],
    "no-debugger": "off",
    "eol-last": 0,
    "comma-dangle": [
      2,
      "never"
    ],
    "import/no-extraneous-dependencies": [
      0,
      {
        "devDependencies": true
      }
    ],
    "arrow-body-style": [
      "error",
      "always"
    ],
    "react/prop-types": 0,
    "no-console": "off",
    "global-require": 0,
    "no-else-return": 0,
    "no-nested-ternary": 0,
    "prefer-template": 0,
    "max-len": [
      "error",
      {
        "code": 250,
        "tabWidth": 2,
        "ignoreComments": true
      }
    ],
    "react/sort-comp": 0
  }
}
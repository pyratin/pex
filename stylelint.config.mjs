/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['!**/*.scss'],
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global', 'local'] }
    ],
    'selector-class-pattern': null
  }
};

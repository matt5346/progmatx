module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'nuxt/no-cjs-in-config': 'off',
    'vue/no-v-html': 'off',
    'no-console': 0,
    'standard/no-callback-literal': 'off'
  }
}

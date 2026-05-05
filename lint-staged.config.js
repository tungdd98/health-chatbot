module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix --no-ignore', 'prettier --write'],
  '*.{json,md,css}': ['prettier --write'],
};

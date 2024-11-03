const path = require('path');

module.exports = {
  entry: {
    app: './js/map.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/map.js',
  },
};

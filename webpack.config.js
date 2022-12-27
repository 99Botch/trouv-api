const path = require('path');
const {
    NODE_ENV = 'production',
} = process.env;
module.exports = {
    target: 'node',
    entry: './index.js',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'dist.js',
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.js'],
    },
    externals: [
        /^(?!\.|\/).+/i,
    ],
}
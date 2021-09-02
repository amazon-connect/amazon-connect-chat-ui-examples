const path = require('path')

const BUILD_DIR = path.resolve(__dirname + '/public')
const APP_DIR = path.resolve(__dirname + '/src')

module.exports = {
    mode: 'development',
    entry: APP_DIR + '/index.js',
    output: {
        filename: 'ACChat.js',
        path: BUILD_DIR
    },
    devServer: {
        contentBase: path.join(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: APP_DIR,
                exclude: [path.join(__dirname, '/node_modules')]
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    }
}
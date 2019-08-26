const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const UMD = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'BaiHuiYiBao', // 以库的形式导出入口文件
    libraryTarget: 'umd' // 以库的形式导出入口文件时，输出的类型,这里是通过umd的方式来暴露library,适用于使用方import的方式导入npm包
  },
  // optimization: {
  //   minimize: true
  // },
  plugins: [new CleanWebpackPlugin()]
};

const CLIENT = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }, {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.js' ]
    },
    output: {
      filename: 'BaiHuiYiBao.js',
      path: path.resolve(__dirname, 'test/js'),
      library: 'BaiHuiYiBao', // 以库的形式导出入口文件
      libraryTarget: 'window'// 以库的形式导出入口文件时，输出的类型。这里你导出的方法变量会挂载到window.demo上，适用于使用方通过window对象访问
    },
    // optimization: {
    //   minimize: true
    // },
    plugins: [new CleanWebpackPlugin()]
};
module.exports = [UMD, CLIENT];
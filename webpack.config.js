const path = require('path');
const glob = require('glob');
//因为我们需要同步检查html模板，所以我们需要引入node的glob对象使用
// 启用热更新的 第2步
const webpack = require('webpack');
const uglify = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin"); //CSS单独提取
const PurifyCSSPlugin = require("purifycss-webpack");
const copyWebpackPlugin = require("copy-webpack-plugin");


// 导入在内存中生成 HTML 页面的 插件
// 只要是插件，都一定要 放到 plugins 节点中去
// 这个插件的两个作用：
//  1. 自动在内存中根据指定页面生成一个内存的页面
//  2. 自动，把打包好的 bundle.js 追加到页面中去

const htmlWebpackPlugin = require('html-webpack-plugin');

// var website ={
//     publicPath:"http://192.168.1.108:8080/"
// }
//这里的IP和端口，是你本机的ip或者是你devServer配置的IP和端口。

// 这个配置文件，起始就是一个 JS 文件，通过 Node 中的模块操作，向外暴露了一个 配置对象
module.exports = {
    //入口文件的配置项
    devtool: 'eval-source-map',
    //手动指定入口与出口
    // entry: path.join(__dirname, './src/main.js'),// 入口，表示，要使用 webpack 打包哪个文件webpack
    entry:{
        main:'./src/main.js',
    },
    output: { // 输出文件相关的配置
        path: path.join(__dirname, './dist'), // 指定 打包好的文件，输出到哪个目录中去
        // filename: 'bundle.js' // 这是指定 输出的文件的名称
        //输出的文件名称
        filename:'[name].js',
        // publicPath:website.publicPath
    },
    module:{//配置所有第三方模块，加载器
        rules: [  //所有第三方的匹配规则
            // { test: /\.css$/, use: ['style-loader', 'css-loader'] }, //  配置处理 .css 文件的第三方loader 规则
            // { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }, //配置处理 .less 文件的第三方 loader 规则
            // { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] }, // 配置处理 .scss 文件的 第三方 loader 规则
            // { test: /\.(jpg|png|gif|bmp|jpeg)$/, use: 'url-loader?limit=7631&name=[hash:8]-[name].[ext]' }, // 处理 图片路径的 loader
            // limit 给定的值，是图片的大小，单位是 byte， 如果我们引用的 图片，大于或等于给定的 limit值，则不会被转为base64格式的字符串， 如果 图片小于给定的 limit 值，则会被转为 base64的字符串
            // {
            //     test:require.resolve('jquery'),
            //     loader:'expose-loader?$!expose-loader?jQuery'
            // },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        'postcss-loader'
                    ]
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },

            { test: /\.(ttf|eot|svg|woff|woff2)$/, use: 'url-loader' }, // 处理 字体文件的 loader
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ }, // 配置 Babel 来转换高级的ES语法
            {
                test:/\.(png|jpg|gif)/ ,
                use:[{
                    loader:'url-loader',
                    options:{
                        limit:7631,
                        outputPath:'images/',
                    }
                }]
            },
            // { test: /\.(jpg|png|gif|bmp|jpeg)$/, use: 'url-loader?limit=7631&name=[hash:8]-[name].[ext]' }, // 处理 图片路径的 loader

            {
                test: /\.(htm|html)$/i,
                use:[ 'html-withimg-loader']
            },

            { test: /\.vue$/, use: 'vue-loader' }

        ]

    },
    devServer: { // 这是配置 dev-server 命令参数的第二种形式，相对来说，这种方式麻烦一些
        //  --open --port 3000 --contentBase src --hot
        open: true, // 自动打开浏览器
        port: 3000, // 设置启动时候的运行端口
        contentBase: 'src', // 指定托管的根目录
        // hot: true // 启用热更新 的 第1步
        inline: true,
    },
    plugins: [ // 配置插件的节点

        new uglify(),//配置压缩

        new htmlWebpackPlugin({ // 创建一个 在内存中 生成 HTML  页面的插件
            minify:{
                removeAttributeQuotes:true
            },
            hash:true,
            template: path.join(__dirname, './src/index.html'), // 指定 模板页面，将来会根据指定的页面路径，去生成内存中的 页面
            filename: 'index.html' // 指定生成的页面的名称
        }),


        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'src/*.html')),
        }),
        // //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。

        // new webpack.ProvidePlugin({
        //     $:'jquery',
        //     jQuery: "jquery",
        //
        // }),

        // new webpack.optimize.CommonsChunkPlugin({
        //     //name对应入口文件中的名字，我们起的是jQuery
        //     name:['jquery'],
        //     //把文件打包到哪里，是一个路径
        //     filename:"assets/js/[name].js",
        //     //最小打包的文件模块数，这里直接写2就好
        //     minChunks:2
        // }),
        new copyWebpackPlugin([{
            // from:__dirname+'/src/public',
            // to:'./public'
            from: __dirname + '/src/public',
            to:'./public'
        }]),
        new ExtractTextPlugin("styles.css"),
        new webpack.HotModuleReplacementPlugin(), // new 一个热更新的 模块对象， 这是 启用热更新的第 3 步

    ],
    //	watchOptions: {
    //		//检测修改的时间，以毫秒为单位
    //		poll: 1000,
    //		//防止重复保存而发生重复编译错误。这里设置的500是半秒内重复保存，不进行打包操作
    //		aggregeateTimeout: 500,
    //		//不监听的目录
    //		ignored: /node_modules/
    //	}
    //	}
};

// 当我们在 控制台，直接输入 webpack 命令执行的时候，webpack 做了以下几步：
//  1. 首先，webpack 发现，我们并没有通过命令的形式，给它指定入口和出口
//  2. webpack 就会去 项目的 根目录中，查找一个叫做 `webpack.config.js` 的配置文件
//  3. 当找到配置文件后，webpack 会去解析执行这个 配置文件，当解析执行完配置文件后，就得到了 配置文件中，导出的配置对象
//  4. 当 webpack 拿到 配置对象后，就拿到了 配置对象中，指定的 入口  和 出口，然后进行打包构建；

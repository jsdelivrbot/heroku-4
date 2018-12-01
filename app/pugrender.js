const isDev = process.env.NODE_ENV === 'development';
const Pug = require('koa-pug');
const path = require('path');
const pug = module.exports = app => new Pug({
    viewPath: './views',
    debug: isDev,
    pretty: false,
    compileDebug: isDev,
    basedir: path.resolve('views'),
    app: app
})




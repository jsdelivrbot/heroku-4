const Router = require('koa-router');

const router = module.exports = new Router;

const defopt = {
    nav: [
        {
            name: "Home",
            href: "/"
        },
        {
            name: "Creator",
            href: "/creator"
        },
        {
            name: "Game",
            href: "/game"
        },
        {
            name: "Ali",
            href: "/ali"
        }
    ],
    css: [
        "blocks.css",
        "elements.css",
        "containers.css",
        "columns.css",
        "media.css",
        "blocks.css"
    ],
    js: [
        "script.js",
        "fetch.js"
    ]
}
router
    .get('/', async ctx => {
        await ctx.render('index', {
            js: defopt.js,
            css: defopt.css,
            nav: defopt.nav
        })
    })
    .get('/creator', async ctx => {
        await ctx.render('pages/svgcreator', {
            headertype: "min",
            footertype: "min",
            nav: defopt.nav,
            css: defopt.css,
            js: ["snap.svg-min.js", "svgcreator.js"]
        })
    })
    .get('/game', async ctx => {
        await ctx.render('index', {
            js: ["snap.svg-min.js", "svgcreator.js"],
            css: defopt.css,
            nav: defopt.nav,
        })
    })
    .get('/aliroom', async ctx => {
        await ctx.render('pages/aliroom', {
            headertype: "min",
            footertype: "min",
            nav: defopt.nav,
            css: defopt.css,
            js: defopt.js
        })
    })
    .get('*', async ctx => {
        await ctx.render('404', {
            css: 'containers.css'
        })
    })


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
        }
    ],
    css: [
        "blocks.css",
        "elements.css",
        "containers.css",
        "columns.css",
        "media.css",
        "blocks.css"
    ]
}
router
    .get('/', async ctx => {
        await ctx.render('index', {
            js: 'script.js',
            css: defopt.css,
            nav: defopt.nav
        })
    })
    .get('/creator', async ctx => {
        await ctx.render('pages/svgcreator', {
            nav: defopt.nav,
            css: defopt.css,
            js: ['svgsreator.js', 'snap.svg.js']
        })
    })
    .get('/game', async ctx => {
        await ctx.render('index', {
            js: ['svgsreator.js', 'snap.svg.js'],
            css: defopt.css,
            nav: defopt.nav
        })
    })
    .get('*', async ctx => {
        await ctx.render('404', {
            css: 'containers.css'
        })
    })


const Router = require('koa-router');

const router = module.exports = new Router;

router
    .get('/', async ctx => {
        await ctx.render('index', {
            js: 'script.js',
            css: ['style.css', 'containers.css'],
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
            ]
        })
    })
    .get('/creator', async ctx => {
        await ctx.render('pages/svgcreator', {
            css: 'containers.css',
            js: ['svgsreator.js', 'snap.svg.js']
        })
    })
    .get('*', async ctx => {
        await ctx.render('404', {
            css: 'containers.css'
        })
    })


const Router = require('koa-router');

const router = module.exports = new Router;

const nav = [
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
];
router
    .get('/', async ctx => {
        await ctx.render('index', {
            js: 'script.js',
            css: ['style.css', 'containers.css'],
            nav: nav
        })
    })
    .get('/creator', async ctx => {
        await ctx.render('pages/svgcreator', {
            css: 'containers.css',
            js: ['svgsreator.js', 'snap.svg.js']
        })
    })
    .get('/game', async ctx => {
        await ctx.render('index', {
            css: ['containers.css', 'elements.css'],
            js: ['svgsreator.js', 'snap.svg.js'],
            nav: nav
        })
    })
    .get('*', async ctx => {
        await ctx.render('404', {
            css: 'containers.css'
        })
    })


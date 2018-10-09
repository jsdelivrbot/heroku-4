const Router = require('koa-router');

const router = module.exports = new Router;

router.get('/', (ctx, next) => {
    try {
        ctx.body = "Всем привет!";
    } catch (e){
        console.error(e.message);
    }
    })
    .get('/:part', (ctx, next) => {
        try {
            ctx.body = `Hello, my dear friend <b>${ctx.params.part}</b>`;
        } catch (e) {
            ctx.body = "Нет такой страницы";
        }
    })
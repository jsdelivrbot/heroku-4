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
            ctx.body = `Hello, my dear friend ${ctx.params.part}`;
        } catch (e) {
            ctx.body = "Нет такой страницы";
        }
    })
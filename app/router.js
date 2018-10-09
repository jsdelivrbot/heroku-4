const Router = require('koa-router');

const router = module.exports = new Router;

router.get('/', (ctx, next) => {
    try {
        ctx.body = "hello";
    } catch (e){
        console.error(e.message);
    }
    })
    .get('/:part', (ctx, next) => {
        try {
            ctx.render(`${ctx.params.part}/index`);
        } catch (e) {
            ctx.body = "Нет такой страницы";
        }
    })
    // .post(

    // )
    // .put(

    // )
    // .del()
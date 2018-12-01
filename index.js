const Koa = require('koa'),
  app = new Koa();
const router = require('./app/router');
const pug = require('./app/pugrender');
const serve = require('koa-static');
const path = require('path');
const PORT = process.env.PORT || 3000;

pug(app);
app.use(serve('./public'));
app.use(serve('./public/css'));
app.use(serve('./public/js'));
app.use(router.allowedMethods());
app.use(router.routes());


app.listen(PORT);
console.log(`Server ready on port: ${PORT}\n`);
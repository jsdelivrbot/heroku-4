const Koa = require('koa'),
  app = new Koa();
const router = require('./app/router');
const path = require('path')
const PORT = process.env.PORT || 5000

app.use(router.allowedMethods());
app.use(router.routes());


app.listen(3000);
console.log(`Server ready on port: ${PORT}\n`);
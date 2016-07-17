var koa = require('koa');
var serve = require('koa-static');
var Router = require('koa-router');
var koaBody   = require('koa-body');
var app = koa();

var apiRoutes = require('./apiRoutes');

var router = new Router();
app.use(koaBody());

router.use('/api', function *(next){
  yield next;
}, apiRoutes.routes());

app.use(serve('public'));
app.use(router.routes());
app.listen(9000);

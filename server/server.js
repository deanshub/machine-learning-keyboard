let koa = require('koa')
let serve = require('koa-static')
let Router = require('koa-router')
let koaBody   = require('koa-body')
let webpackMiddleware = require('koa-webpack-dev-middleware')
let webpack = require('webpack')
let webpackConfig = require('../webpack.config')

let app = koa()
let apiRoutes = require('./apiRoutes')
let router = new Router()

app.use(koaBody())
app.use(webpackMiddleware(webpack(webpackConfig)))

router.use('/api', function *(next){
  yield next
}, apiRoutes.routes())

app.use(serve('client'))
app.use(router.routes())
app.listen(9000)

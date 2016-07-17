let fs = require('fs')
let path = require('path')
let uuid = require('node-uuid')
let Router = require('koa-router')
let router = new Router()

router.post('/path', function *(){
  console.log(this.request.body);
  yield this.body = {ok:1}
})

router.post('/trainingdata', function *(){
  let self = this
  yield new Promise(function (resolve, reject) {
    fs.writeFile(path.join('trainingdata',`${uuid.v4()}.json`), JSON.stringify(self.request.body, null, 2), (err) => {
      if (err) throw reject(err)

      self.body = {
        success:true,
      }
      resolve()
    })
  })
})

module.exports = router

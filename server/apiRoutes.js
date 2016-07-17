var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var Router = require('koa-router');
var router = new Router();

router.post('/trainingdata', function *(next){
  var self = this;
  return new Promise(function (resolve, reject) {
    fs.writeFile(path.join('trainingdata',uuid.v4() + '.json'), JSON.stringify(self.request.body, null, 2), (err) => {
      if (err) throw reject(err);

      self.body = {
        success:true
      };
      resolve();
    });
  });
});

module.exports = router;

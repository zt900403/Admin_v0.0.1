/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var User = require('../libs/User');
var basicAuth = require('basic-auth');

var router = express.Router();

router.post('/logout', function(req, res, next) {

    if (req.session.uid) {
        req.session.destroy(function(err) {
            if (err) throw err;
            res.json(200);
        });
    }

});

router.basicAuth = function(req, res, next) {
      var user = basicAuth(req);
      if (!user || !user.name || !user.pass) {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.send(401);
      }
      User.authenticate(user.name, user.pass, function(err, user) {
          if (err) return next(err);
          next();
      });
};

module.exports = router;
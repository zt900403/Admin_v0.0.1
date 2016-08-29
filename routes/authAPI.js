/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var User = require('../libs/User');
var basicAuth = require('basic-auth');
var multiparty = require('multiparty');
var path = require('path');
var join = path.join;
var fs = require('fs');

var router = express.Router();

router.post('/logout', function(req, res, next) {

    if (req.session.uid) {
        User.logoutById(req.session.uid, function(err) {
            if (err) throw err;
            req.session.destroy(function(err) {
                if (err) throw err;
                res.json(200);
            });
        });
    }

});

router.post('/uploadFile', function(req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var name;
        if (fields.name.length === 0 || fields.name[0] == 'undefined') {
            name = null;
        } else {
            var name = fields.name[0];
        }

        var len = files.file.length;
        for ( var i = 0; i < len; ++i ) {
            var ext;
            if (name) {
                var matched = name.toString().match(/\.(\w*)/);
                if ( matched ) {
                    ext = matched[0];
                }

                if (typeof(ext) == 'undefined') {

                    if ( matched = files.file[i].originalFilename.match(/\.(\w*)/) )
                        ext = matched[0];
                    else
                        ext = '';
                }
            }


            var name = name ? (name + (i ? i : '')) + ext : files.file[i].originalFilename;


            var path = join(req.app.get('filesDir'), name);

            fs.rename(files.file[i].path, path, function(err) {
                if (err) return next(err);

            });

        }
    });

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
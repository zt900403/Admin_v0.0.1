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
var XLSX = require('xlsx');

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



        files.file.forEach(function(file) {
            var ext;
            if (name) {
                var matched = name.toString().match(/\.(\w*)/);
                if ( matched ) {
                    ext = matched[0];
                }
                if (typeof(ext) == 'undefined') {

                    if ( matched = file.originalFilename.match(/\.(\w*)/) )
                        ext = matched[0];
                    else
                        ext = '';
                }
            }

            var name = name ? name + ext  : file.originalFilename;
            name = Date.now() + name;


            var path = join(req.app.get('filesDir') ,　req.session.uid.toString());
            fs.exists(path,  function(exists) {
                if (!exists) {
                    fs.mkdir(path, function(err) {
                        if (err) return next(err);
                    });
                }

                path = join(path, name);
                fs.rename(file.path, path, function(err) {
                    if (err) return next(err);
                    var workbook = XLSX.readFile(path);
                    var sheet_name_list = workbook.SheetNames;
                    sheet_name_list.forEach(function(y) { /* iterate through sheets */
                        var worksheet = workbook.Sheets[y];
                        var sheetData = [];
                        var sheetColDefs = [];
                        for (z in worksheet) {
                            /* all keys that do not begin with "!" correspond to cell addresses */
                            if(z[0] === '!') continue;
                            var matched = z.match(/^([a-zA-Z]*)(\d*)$/);
                            if (matched) {
                                sheetColDefs.push({filed: matched[1], width: 50});
                            }
                            console.log(y + "!" + z + "=" + JSON.stringify(worksheet[z].v));
                        }
                    });
                });

            });

        });


    });

});

router.basicAuth = function(req, res, next) {
      var user = basicAuth(req);
      if (!user || !user.name || !user.pass || !req.session.uid) {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.send(401);
      }
      User.authenticate(user.name, user.pass, function(err, user) {
          if (err) return next(err);
          next();
      });
};

module.exports = router;
/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var User = require('../libs/User');
var File = require('../libs/File');
var basicAuth = require('basic-auth');
var multiparty = require('multiparty');


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
        var filename = fields.name[0];
        File.filenameValidate(filename, function(err, exists) {
            if (err) return res.status(500).json({err : '数据库读取异常!'});
            if (exists) return res.status(400).json({err: '表名字已存在! 请更换一个!'});
            File.parseExcelAndSave(req, filename, files.file[0],req.user, function(err) {
                if (err) return res.status(500).json({err: '文件解析或入库错误!'});
                return res.json({result: '文件上传成功!'});
            });
        });

    });

});

router.get('/validFilenames', function(req, res, next) {
    File.validFilenames(req.user, function(err, filenames) {
        if (err) return res.status(500).json({err: err.message});
        res.json(filenames);
    });
});

router.get('/fileByName', function(req, res, next) {
    File.findFileByName(req.query.filename, function(err, file) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        res.json(file);
    });
});

router.post('/requestEditFile', function(req, res, next) {
    File.requestEditFile(req.query.filename, function(err, result) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        if (!result) return res.status(400).json({err: '请求编辑失败! 该文档已上锁!'});
        res.json({result: '请求编辑成功!'});
    });
});

router.post('/completeEditFile', function(req, res, next) {
    File.completeEditFile(req.query.filename, function(err, result) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        if (!result) return res.status(400).json({err: '文件锁异常!'});
        res.json({result: '编辑成功!'});
    });
});


router.basicAuth = function(req, res, next) {
      var user = basicAuth(req);
      if (!user || !user.name || !user.pass || user.pass == 'undefined' || !req.session.uid) {
          res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
          return res.sendStatus(401);
      }
      User.authenticate(user.name, user.pass, function(err, user) {
          if (err) return next(err);
          req.user = user;
          next();
      });
};

module.exports = router;
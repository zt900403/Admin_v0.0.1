/**
 * Created by Lenovo on 2016/8/26.
 */
var express = require('express');
var User = require('../libs/User');
var File = require('../libs/File');
var Role = require('../libs/Role');
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

router.post('/createBlankFile', function(req, res, next) {
    File.filenameValidate(req.query.filename, function(err, exists) {
        if (err) return res.status(500).json({err : '数据库读取异常!'});
        if (exists) return res.status(400).json({err: '表名字已存在! 请更换一个!'});
        File.createBlankFile(req, function(err) {
            if (err) return res.status(500).json({err: err.message});
            res.json({result: '创建成功!'});
        });
    });
});


router.get('/validFilenamesAndLock', function(req, res, next) {
    File.validFilenamesAndLock(req.user, function(err, files) {
        if (err) return res.status(500).json({err: err.message});
        res.json(files);
    });
});

router.get('/getfileByName', function(req, res, next) {
    File.findOneFile({name: req.query.filename}, function(err, file) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        res.json(file);
    });
});

router.post('/requestEditFile', function(req, res, next) {
    File.requestEditFile(req, function(err, file) {
        if (err) return res.status(500).json({err: '请求文件无效,或文件已经上锁!'});
        if (!file) return res.status(400).json({err: '请求编辑失败! 该文档已上锁!'});
        res.json(file);
    });
});

router.post('/cancelEditFile', function(req, res, next) {
    File.findFileAndUpdate({name: req.query.filename, locked: req.user.user}, {locked: 'unlocked'}, function(err, file) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        if (!file) return res.status(400).json({err: '请求文件不存在,或该文件已上锁!'});
        res.json({result:'取消编辑成功!'});
    });
});

router.post('/updateFile', function(req, res, next) {

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({err: '解析表单失败!'});
        if (fields.file.length == 0) return res.status(400).json({err: '无效的输入文件!'});
        var inputFile = JSON.parse(fields.file[0]);
        File.findFileAndUpdate({name: inputFile.name, locked: req.user.user}, inputFile, function(err, file) {
            if (err) return res.status(500).json({err: '读取数据库异常!'});
            if (!file)  return res.status(400).json({err: '文件不存在!'});
            return res.json({result: '更新文件完毕!'});
        });

    });

});

router.get('/fileLockStatus', function(req, res, next) {
    File.findOneFile({name: req.query.filename, status: 'active'}, function(err, file) {
        if (err) return res.status(500).json({err: '读取数据库异常!'});
        if (!file) return res.status(400).json({err: '文件不存在!'});
        return res.json(file.locked);
    });
});


router.post('/removeFiles', function(req, res, next) {
    var filenames = req.query.filenames;
    if (!filenames) return res.status(400).json({err: '无效参数'});
    if (!Array.isArray(filenames)) {
        filenames = Array(filenames);
    }
    File.removeFiles(filenames, function(err, result) {
        if (err) return res.status(500).json({err: err.message});
        Role.removeRolesFile(filenames, function(err) {
            if (err) return res.status(500).json({err: err.message});
            res.json(result);
        });
    });
});

router.post('/createNewRole', function(req, res, next) {
    var rolename = req.query.rolename;
    if (!rolename) return res.status(401).json({err: '无效参数'});
    Role.createRole(rolename, function(err) {
        if (err) return res.status(500).json({err: err.message});
        res.json({result: "创建新角色成功!"});
    });
});


router.get('/getRolesOthersAndFilenames', function(req, res, next) {
    var result = {};
    Role.getAllRoles(function(err, roles) {
        if (err) return res.status(500).json({err: err.message});
        result.roles = roles;
        File.getAllActiveFilenames(function(err, filesnames) {
            if (err) return res.status(500).json({err: '读取数据库错误!'});
            result.filenames = filesnames;
            result.others = ['createFile', 'deleteFile', 'createWorkOrder', 'handleWorkOrder',
                'RoleEditAndAuth'];
            res.json(result);
        });
    });
});

router.post('/saveRole', function(req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({err: '解析表单失败!'});
        if (!fields.role) return res.status(400).json({err: '无效的输入参数!'});
        var role = JSON.parse(fields.role[0]);
        Role.findOneAndUpdate({name: role.name}, role, function(err) {
            if (err) return res.status(500).json({err: err.message});
            res.json({result: '保存成功!'});
        });
    });
});

router.get('/getAllUsersAndRoles', function(req, res, next) {
    User.getAllUsersRole(function(err, users) {
        if (err) return res.status(500).json({err: err.message});
        Role.getAllRoles(function(err, roles) {
            var result = {};
            result.rolesname = [];
            roles.forEach(function(role) {
                result.rolesname.push(role.name);
            });

            result.users = users;
            res.json(result);
        });
    });
});

router.post('/updateUser', function(req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) return res.status(500).json({err: '解析表单失败!'});
        if (!fields.user) return res.status(400).json({err: '无效的输入参数!'});
        var user = JSON.parse(fields.user[0]);
        User.updateUser(user, function(err, one) {
            if (err) return res.status(500).json({err: err.message});
            res.json({result: '保存成功!'});
        });
    });
});


router.basicAuth = function(req, res, next) {
      var user = basicAuth(req);
      if (!user || !user.name || !user.pass || user.pass == 'undefined') { //|| !req.session.uid) {
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
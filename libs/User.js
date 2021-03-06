/**
 * Created by ZT on 2016/8/27.
 */
var db = require('../models');
var bcrypt = require('bcryptjs');
var IdGenerator = require('../models/IdGenerator');

function User(obj) {
    this.user = obj;
}

User.prototype.save = function(fn) {
    var user = this.user;
    bcrypt.genSalt(4, function(err, salt) {
        if (err) return fn(err);
        user.salt = salt;
        bcrypt.hash(user.PWD, salt, function(err, hash) {
            if (err) return fn(err);
            user.PWD = hash;
            IdGenerator.getNewID('user',function(newid) {
                user.id = newid;
                var userModel = new db.user(user);
                userModel.save(function(err) {
                    if (err) return fn(err);
                    fn();
                });
            });
        });
    });
};


User.findUserById = function(userid, fn) {
    db.user.findOne({
        id: userid
    }, fn);
};

User.findUserByUser = function(user, fn) {
    db.user.findOne({
        user: user
    }, fn);
};

User.findOneAndUpdateByUser = function(user, update, fn) {
    db.user.findOneAndUpdate({
        user: user
    }, update, fn);
};

User.UpdateById = function(id, update, fn) {
    db.user.update({
        id: id
    }, update, fn);
};

User.loginByUser = function(user, fn) {
    this.findOneAndUpdateByUser(user.user, {LLTime: Date.now(),online: true}, function(err, one) {
        if (err) return fn(new Error('读数据库异常!'));
        if (!one) return fn(new Error('用户名不存在!'));
        bcrypt.hash(user.PWD, one.salt, function(err, hash) {
            if (err) fn(err);
            if (hash == one.PWD) {
                return fn(null, one);
            } else {
                return fn(new Error('密码错误!'));
            }
        })
    });
};

User.logoutById = function(id, fn) {
    this.UpdateById(id, {online: false}, function(err) {
        if (err) fn(new Error('写入数据库失败!'));
        fn();
    });
};

User.getAllUsersRole = function(fn) {
    db.user.find({}, {user: 1, role: 1, group: 1, _id: 0}, fn);
};

User.updateUser = function(user, fn) {
    db.user.findOneAndUpdate({user: user.user}, user, fn);
};

User.arrayUnique = function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};


User.findUserRightsByRole = function(user, fn) {
    db.role.find({name: {$in: [user.role, user.group]}}, function(err, roles) {
        if (err) return fn(err);
        if (roles.length == 0) return fn();
        var result = {};
        if (Array.isArray(roles) && roles.length >= 2) {
            result.fileReader = User.arrayUnique(roles[0].fileReader.concat(roles[1].fileReader));
            result.fileWriter = User.arrayUnique(roles[0].fileWriter.concat(roles[1].fileWriter));
            result.others = User.arrayUnique(roles[0].others.concat(roles[1].others));
        } else {
            result.fileReader = roles[0].fileReader;
            result.fileWriter = roles[0].fileWriter;
            result.others = roles[0].others;
        }
        fn(null, result);
    });
};

User.authenticate = function(name, pass, fn){
    User.findUserByUser(name, function(err, user){
        if (err) return fn(err);
        if (!user) return fn(new Error('not found the user!'));
        if (pass == user.PWD) return fn(null, user._doc);
        fn(new Error('wrong password!'));
        });

};



module.exports = User;
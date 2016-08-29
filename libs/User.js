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
    bcrypt.genSalt(12, function(err, salt) {
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

User.loginByUser = function(user, fn) {
    this.findUserByUser(user.user, function(err, one) {
        if (err) fn(new Error('用户不存在!'));
        bcrypt.hash(user.PWD, one.salt, function(err, hash) {
            if (err) fn(err);
            if (hash == one.PWD) {
                fn(null, one._doc);
            } else {
                fn(new Error('密码错误!'));
            }
        })
    });
};

User.authenticate = function(name, pass, fn){
    User.findUserByUser(name, function(err, user){
        if (err) return fn(err);
        if (!user.id) return fn();
        if (user.PWD == pass) return fn(null, user._doc);
        fn();
    });
};



module.exports = User;
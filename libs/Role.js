/**
 * Created by Lenovo on 2016/9/20.
 */

var db = require('../models');
function Role(obj) {
    this.role = obj;
}

Role.prototype.save = function(fn) {
    var role = this.role;
    var roleModel = new db.role(role);
    roleModel.save(function(err) {
        if (err) return fn(err);
        fn();
    });
};

Role.createRole = function(rolename, fn) {
    var role = {};
    role.name = rolename;
    role.fileReader = [];
    role.fileWriter = [];
    role.others = [];
    Role.findOneRole({name: rolename}, {}, function(err, one) {
        if (err) return fn(err);
        if (one) return fn(new Error('角色名已存在!'));
        var roleModel = new db.role(role);
        roleModel.save(function(err) {
            if (err) return fn(err);
            fn();
        });
    });
};


Role.findOneRole = function(query, projection, fn) {
    db.role.findOne(query, projection, fn);
};

Role.find = function(query, projection, fn) {
    db.role.find(query, projection, fn);
};

Role.getAllRoles = function(fn) {
    Role.find({}, {}, fn);
};

module.exports = Role;
//end of file
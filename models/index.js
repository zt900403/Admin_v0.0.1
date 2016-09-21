/**
 * Created by ZT on 2016/8/26.
 */
var mongoose = require('mongoose');
var config = require('../env.json');
mongoose.connect(config.MongoDB_URI);
exports.user = mongoose.model('user', require('./user'));
exports.user.prototype.toJSON = function() {

    return {
        id : this.id,
        user: this.user,
        PWD: this.PWD,
        files: this.files,
        group: this.group,
        name : this.name,
        tele : this.tele,
        mobile: this.mobile,
        email: this.email,
        department: this.department,
        role: this.role,
        fileReader: this.fileReader,
        fileWriter: this.fileWriter,
        others: this.others
    }

};

exports.file = mongoose.model('file', require('./file'));
exports.file.prototype.toJSON = function() {
    return {
        owner: this.owner,
        name: this.name,
        CTime: this.CTime,
        MTime: this.MTime,
        MUser: this.MUser,
        Sheets : this.Sheets,
        comments: this.comments,
        locked: this.locked,
    }
};

exports.role = mongoose.model('role', require('./role'));
exports.role.prototype.toJSON = function() {
    return {
        name: this.name,
        fileReader: this.fileReader,
        fileWriter: this.fileWriter,
        others: this.others
    }
};

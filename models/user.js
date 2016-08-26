/**
 * Created by Lenovo on 2016/8/26.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = new Schema({
    id: Number,
    user: String,
    PWD: String,
    salt: String,
    CTime: Date,                //create time
    LLTime: Date,               //Last login time
    files: [String],			//the files of you create
    filesRights:{
        RW: [String],
        M: [String]             //modify the file rights
    },
    name: String,
    tele: String,
    Mobile: Number,
    email: String,
    department: String,
    online: Boolean,
    role: String                //admin,normal,inactive
});

User.statics.findUserById = function(userid, callback) {
    this.findOne({
        id: userid
    }, callback);
};

User.statics.assign = function(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
    return this;
}

module.exports = User;
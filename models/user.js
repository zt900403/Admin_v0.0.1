/**
 * Created by Lenovo on 2016/8/26.
 */
var mongoose = require('mongoose');

var IdGenerator = require('./IdGenerator');


var Schema = mongoose.Schema;


var userSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    PWD: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    CTime: {                    //create time
        type: Date,
        default: Date.now()
    },
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
    online: {
        type: Boolean,
        default: false
    },
    group: [{
        type: String,
        default: 'default'
    }],
    role: {
        type: String,
        default: 'normal'
    }                //admin,normal,inactive

},{
    versionKey: false           // You should be aware of the outcome after set to false
});



module.exports = userSchema;
/**
 * Created by Lenovo on 2016/8/30.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sheetColDefsSchema = new Schema({
    field: {
        type: String,
        required: true
    },
    displayName: String,
    enableCellEdit: Boolean,
    type : {
        type: String,
        default: 'string'
    },
    width: {
        type: Number,
        required: true
    }
},{
    versionKey: false           // You should be aware of the outcome after set to false
});


var sheetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastHeader: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'active'           //active discard
    },
    columnDefs : [sheetColDefsSchema],
    rowDatas: []
},{
    versionKey: false           // You should be aware of the outcome after set to false
});

var commentSchema = new Schema({
    No: {                       //serial number
        type: Number,
        required: true
    },
    CTime: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
},{
    versionKey: false           // You should be aware of the outcome after set to false
});

var fileSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true
    },
    CTime: {
        type: Date,
        default: Date.now
    },
    MTime: {
        type: Date,
        default: Date.now
    },
    MUser: {
        type: String,
        required: true
    },
    path: String,
    Rights: {
        RW: [],
        M: [],
        GroupRW: [],
        GroupM: []
    },
    Sheets : [sheetSchema],
    comments:[commentSchema],
    locked: {
        type: String,
        default: 'unlocked'
    },
    status: {
        type: String,
        default: 'active'           //active    discard
    }
},{
    versionKey: false           // You should be aware of the outcome after set to false
});

fileSchema.pre("save",function(next) {
    if (this.Rights.GroupRW.length == 0)
        this.Rights.GroupRW.push("default");

    if (this.Rights.GroupM.length == 0)
        this.Rights.GroupM.push("default");

    this.MTime = Date.now();

    next();
});

module.exports = fileSchema;
/**
 * Created by ZT on 2016/9/24.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var historySchema = new Schema({
    modifyBy: {
        type: String,
        required: true
    },
    notes: String,
    nextAcceptor: {
        type: String,
        required: true
    },
    operation: {
        type: String,
        required: true
    },
    MTime: String
},{
    versionKey: false           // You should be aware of the outcome after set to false
});

var workOrderSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title:{
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    initiator: {
        type: String,
        required: true
    },
    acceptor: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: '处理中'
    },
    CTime: {
        type: Date,
        default: Date.now
    },
    MTime: {
        type: Date,
        default: Date.now
    },
    relevantPeople: [],
    history: [historySchema]

},{
    versionKey: false           // You should be aware of the outcome after set to false
});




module.exports = workOrderSchema;
//end of file

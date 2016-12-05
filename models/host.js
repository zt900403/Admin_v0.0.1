/**
 * Created by Lenovo on 2016/12/2.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hostSchema = new Schema({
    IP: {
        type: String,
        required: true,
        unique: true
    },
    disk : []
},{
    versionKey: false           // You should be aware of the outcome after set to false
});


module.exports = hostSchema;

// end of file
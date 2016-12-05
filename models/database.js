/**
 * Created by Lenovo on 2016/12/2.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var databaseSchema = new Schema({
    DBInstance: {
        type: String,
        required: true,
        unique: true
    },
    TableSpace : []
},{
    versionKey: false           // You should be aware of the outcome after set to false
});


module.exports = databaseSchema;

// end of file
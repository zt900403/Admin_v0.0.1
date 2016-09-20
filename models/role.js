/**
 * Created by Lenovo on 2016/9/20.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var roleSchema = new Schema({
   name:{
       type: String,
       required: true,
       unique: true
   },
    fileReader: [],
    fileWriter: [],
    others:[]
},{
    versionKey: false           // You should be aware of the outcome after set to false
});


module.exports = roleSchema;
//end of file
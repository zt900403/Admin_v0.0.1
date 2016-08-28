/**
 * Created by ZT on 2016/8/26.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://zt900403:zhangtao43@localhost/AdminApp');
exports.user = mongoose.model('user', require('./user'));



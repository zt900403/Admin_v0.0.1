/**
 * Created by ZT on 2016/8/26.
 */
var mongoose = require('mongoose');
var config = require('../env.json');
mongoose.connect(config.MongoDB_URI);
exports.user = mongoose.model('user', require('./user'));



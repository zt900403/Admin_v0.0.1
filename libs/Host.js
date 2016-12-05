/**
 * Created by Lenovo on 2016/12/2.
 */
var db = require('../models');
function Host(obj) {
    this.host = obj;
}

Host.find = function(query, projection, fn) {
    db.host.find(query, projection, fn);
};
module.exports = Host;
// end of file
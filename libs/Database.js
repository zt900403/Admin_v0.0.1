/**
 * Created by Lenovo on 2016/12/2.
 */
var db = require('../models');
function Database(obj) {
    this.database = obj;
}

Database.find = function(query, projection, fn) {
    db.database.find(query, projection, fn);
};
module.exports = Database;
// end of file
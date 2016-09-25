/**
 * Created by ZT on 2016/9/24.
 */


var db = require('../models');
var IdGenerator = require('../models/IdGenerator');

function WorkOrder(obj) {
    this.workorder = obj;
}

WorkOrder.prototype.save = function(fn) {
    var workorder = this.workorder;
    IdGenerator.getNewID('workorder', function(newid) {
        workorder.id = newid;
        var workorderModel = new db.workOrder(workorder);
        workorderModel.save(function(err) {
            if (err) return fn(err);
            fn();
        });
    });
};

WorkOrder.getAllMyAcceptWorkOrder = function(user, group, fn) {
  db.workOrder.find({acceptor: {$in: [user, group]}, status: '处理中'}, fn);
};


WorkOrder.getAllMyPublishWorkOrder = function(user, fn) {
    db.workOrder.find({initiator: user}, fn);
};

WorkOrder.getAllMyProcessedWorkOrder = function(user, fn) {
    db.workOrder.find({initiator: {$ne: user}, relevantPeople: {$in: [user]}}, fn);
};


WorkOrder.findOneAndUpdate = function(query, update, fn) {
    db.workOrder.findOneAndUpdate(query, update, fn);
};

WorkOrder.findOne = function(query, projection, fn) {
    db.workOrder.findOne(query, projection, fn);
};



module.exports = WorkOrder;
//end of file
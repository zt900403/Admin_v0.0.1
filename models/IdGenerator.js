/**
 * Created by ZT on 2016/8/26.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.createConnection('mongodb://zt900403:zhangtao43@localhost/AdminApp');

var IdGenerator = new Schema({
    modelname  : { type: String },
    currentid  : { type: Number, default: 1 }
});


mongoose.model('IdGenerator', IdGenerator);
var idg = mongoose.model('IdGenerator');


idg.getNewID = function(modelName, callback){
    this.findOne({modelname : modelName},function(err,doc){
        if(doc){
            doc.currentid += 1;
        }else{
            doc = new idg();
            doc.modelname = modelName;
        }
        doc.save(function(err){
            if(err) throw err('IdGenerator.getNewID.save() error');
            else callback(parseInt(doc.currentid.toString()));
        });
    });
};

module.exports = idg;
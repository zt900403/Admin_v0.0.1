/**
 * Created by Lenovo on 2016/8/31.
 */
var db = require('../models');
var path = require('path');
var join = path.join;
var fs = require('fs');
var XLSX = require('xlsx');
var async = require('async');

function File(obj) {
    this.file = obj;
}


File.prototype.save = function(fn) {
    var file = this.file;
    var fileModel = new db.file(file);
    fileModel.save(function(err) {
        if (err) return fn(err);
        fn();
    });
};

File.arrayObjectIndexOf = function(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
};


//  < = >
// -1 0 1
File.StringCompareTo = function(l, r) {
    if (l.length < r.length) {
        return -1;
    } else if (l.length > r.length) {
        return 1;
    } else if (l === r) {
        return 0;
    } else if (l < r) {
        return -1;
    } else {
        return 1;
    }
};

File.nextChar = function(char) {                      //Ascii + 1
    if (char.length ==1)
        return String.fromCharCode(char[0].charCodeAt(0) + 1)
    return null;
};

File.CharIncrement = function(char) {
    var len = char.length;
    if (char == 'Z'.repeat(len)) {
        return 'A'.repeat(len+1);
    } else if (len == 1) {
        return File.nextChar(char[0]);
    } else {
        for (var i = len - 1; i != 0; --i) {
            char = File.StringReplaceAt(char, i, File.nextChar(char[i]));
            if (char[i] == '[') {                // '[' == 'Z'.charCodeAt(0) + 1
                char = File.StringReplaceAt(char, i-1, File.nextChar(char[i-1]));
                char = File.StringReplaceAt(char, i, 'A');
            }
        }
        return char;
    }
};

File.StringReplaceAt = function(str, index, character) {
    return str = str.substr(0, index) + character + str.substr(index + character.length);
};

File.parseExcelAndSave = function(_req, _name, _file, _user, fn) {

    var filename = Date.now() + _file.originalFilename;
    var path = join(_req.app.get('filesDir') ,　_req.session.uid.toString());
    fs.exists(path,  function(exists) {
        if (!exists) {
            fs.mkdir(path, function(err) {
                if (err) return fn(err);
            });
        }

        path = join(path, filename);
        fs.rename(_file.path, path, function(err) {
            if (err) return fn(err);
            var workbook = XLSX.readFile(path);

            var fileObj = {};
            fileObj.name = _name;
            fileObj.owner = _user.user;
            fileObj.MUser = _user.user;
            fileObj.path = path;
            fileObj.Rights = {};
            fileObj.Rights.GroupRW = ['default'];
            fileObj.Sheets = [];

            var sheet_name_list = workbook.SheetNames;
            sheet_name_list.forEach(function(y) { /* iterate through sheets */
                var worksheet = workbook.Sheets[y];
                var sheetData = [];
                var sheetColDefs = [];
                sheetColDefs[0] = {
                    field: 'index',
                    displayName: '',
                    enableCellEdit: false,
                    width: 40
                };
                var maxWidthdict = {};
                var lastHeader = '';
                for (z in worksheet) {
                    /* all keys that do not begin with "!" correspond to cell addresses */
                    if (z[0] === '!') continue;
                    var matched = z.match(/^([a-zA-Z]*)(\d*)$/);
                    if (matched) {

                        if (File.StringCompareTo(matched[1],lastHeader) == 1) {
                            lastHeader = matched[1];
                        }

                        var idx = matched[2] - 1;

                        if (!sheetData[idx])
                        {
                            sheetData[idx] = {};
                        }

                        var cell = worksheet[z];

                        if (cell.t == 'n') {
                            if (cell.hasOwnProperty('w') && cell.w === String(cell.v) ) {       //parse to Number
                                sheetData[idx][matched[1]] = cell.v;
                            } else {
                                if (cell.hasOwnProperty('w') && cell.w.includes('%')) {     //parse to percent
                                    sheetData[idx][matched[1]] = cell.w;
                                } else {                             //parse to date
                                    delete cell.w;
                                    cell.z = 'yyyy/mm/dd';
                                    XLSX.utils.format_cell(cell);
                                    if (cell.w.length ==0) {
                                        sheetData[idx][matched[1]] = cell.v;
                                    } else {
                                        sheetData[idx][matched[1]] = cell.w;
                                    }
                                }

                            }
                        } else {
                            sheetData[idx][matched[1]] = cell.v;
                        }


                        if (!maxWidthdict[matched[1]]) {
                            maxWidthdict[matched[1]] = sheetData[idx][matched[1]].toString().length;
                        } else if (maxWidthdict[matched[1]] < sheetData[idx][matched[1]].length){
                            maxWidthdict[matched[1]] = sheetData[idx][matched[1]].toString().length;
                        }
                    }
                }
                for(var i = 0, len = sheetData.length; i < len; ++i) {
                    if (!sheetData[i])
                        sheetData[i] = {};
                    sheetData[i].index = i + 1;
                }

                var tmp = 'A';
                while ( File.StringCompareTo(tmp, lastHeader) != 1 ) {
                    sheetColDefs.push({field: tmp,
                        width: maxWidthdict[tmp] ? maxWidthdict[tmp] * 20 : 20
                        });
                    tmp = File.CharIncrement(tmp);
                }
                //have valid data
                if (sheetColDefs.length > 1) {
                    var sheetObj = {};
                    sheetObj.name = y;
                    sheetObj.lastHeader = lastHeader;
                    sheetObj.columnDefs = sheetColDefs;
                    sheetObj.rowDatas = sheetData;
                    fileObj.Sheets.push(sheetObj);
                }

            });
            var fileModel = new db.file(fileObj);
            fileModel.save(function(err) {
                if (err) return fn(err);

                fn();
            });
        });
    });
};

File.findOneFile = function(query, projection, fn) {
    db.file.findOne(query, projection, fn);
};

File.findFileAndUpdate= function(query, update, fn) {
    db.file.findOneAndUpdate(query, update, fn);
};


File.requestEditFile = function(req, fn) {
    File.findFileAndUpdate({name: req.query.filename, status: 'active', locked: 'unlocked'},
        {locked: req.user.user}, function(err, file) {
        if (err) return fn(err);
        if (!file) return fn(new Error('请求文件无效!'));
        return fn(null, file);
    });
};


File.findFiles = function(query, projections, fn) {
    db.file.find(query, projections, fn);
};


File.filenameValidate = function(filename, fn) {
    File.findOneFile({
        name: filename,
        status: 'active'
    }, {owner:0, CTime:0, MTime:0, MUser:0, path:0, Sheets:0, status:0, Rights:0, comments:0, locked:0},
        function(err, file) {
        if (err) return fn(err);
        if (file) return fn(null, true);
        return fn(null, false);
    });
};

File.validFilenamesAndLock = function(user, fn) {
    if (user.group.length == 0) return fn(new Error('用户未分组!'));
    File.findFiles({
        status: 'active'
    }, {owner:0, CTime:0, MTime:0, MUser:0, path:0, Sheets:0, status:0, Rights:0, comments:0},
        function(err, files) {
        if (err) return fn(err);
        var retfiles = [];
        if (!files) return fn(null, retfiles);
        files.forEach(function(file) {
            retfiles.push({filename: file.name, locked: file.locked});
        });
        fn(null, retfiles);
    });
};

File.createBlankFile = function(req, fn) {
    var fileObj = {};
    fileObj.name = req.query.filename;
    fileObj.owner = fileObj.MUser = req.user.user;
    fileObj.Rights = {};
    fileObj.Rights.GroupRW = ['default'];

    var fileModel = new db.file(fileObj);
    fileModel.save(function(err) {
        if (err) return fn(err);
        fn();
    });
};

File.removeFiles = function(filenames, fn) {
    var calls = [];
    var ret = [];
    var errs = [];
    var collector = function(err, name) {
        if (err) errs.push(err);
        if (name) ret.push(name);
    };
    filenames.forEach(function(filename) {
        calls.push(function(collector) {
            db.file.remove({name: filename}, function(err) {
                if (err) return collector(err);
                collector(null, filename);
            });
        });
    });
    async.parallel(calls, function(err, result) {
        if (err) return fn(err);
        fn(null, ret);
    });
};

File.removeFile = function(filename, fn) {
    db.file.remove({name: filename}, function(err) {
        fn(err);
    });
};

File.getAllActiveFilenames = function(fn) {
    db.file.find({}, {owner:0, CTime:0, MTime:0, MUser:0, path:0, Sheets:0, status:0, Rights:0, comments:0},
    function(err, files) {
        if (err) fn(err);
        var result = [];
        files.forEach(function(file) {
            result.push(file.name);
        });
        fn(null, result);
    });
};

module.exports = File;
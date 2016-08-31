/**
 * Created by Lenovo on 2016/8/31.
 */
var db = require('../models');
var path = require('path');
var join = path.join;
var fs = require('fs');
var XLSX = require('xlsx');


function File(obj) {
    this.File = obj;
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

File.StringNextChar = function(char) {                      //Ascii + 1
    if (char.length ==1)
        return String.fromCharCode(char[0].charCodeAt(0) + 1)
    return null;
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
                if (err) return next(err);
            });
        }

        path = join(path, filename);
        fs.rename(_file.path, path, function(err) {
            if (err) return next(err);
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
                    width: 50
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
                        sheetData[idx][matched[1]] = worksheet[z].v;


                        if (!maxWidthdict[matched[1]]) {
                            maxWidthdict[matched[1]] = worksheet[z].v.length;
                        } else if (maxWidthdict[matched[1]] < worksheet[z].v.length){
                            maxWidthdict[matched[1]] = worksheet[z].v.length;
                        }
                    }
                }
                for(var i = 0, len = sheetData.length; i < len; ++i) {
                    sheetData[i].index = i + 1;
                }

                var tmp = 'A';
                while ( File.StringCompareTo(tmp, lastHeader) != 1 ) {
                    sheetColDefs.push({field: tmp,
                        width: maxWidthdict[tmp] ? maxWidthdict[tmp] * 15 : 15});
                    var len = tmp.length;
                    if (tmp == 'Z'.repeat(len)) {
                        tmp = 'A'.repeat(len+1);
                    } else if (len == 1) {
                        tmp = File.StringNextChar(tmp[0]);
                    } else {
                        for (var i = len - 1; i != 0; --i) {
                            tmp = File.StringReplaceAt(tmp, i, File.StringNextChar(tmp[0]));
                            if (tmp[i] == '[') {                // '[' == 'Z'.charCodeAt(0) + 1
                                tmp = File.StringReplaceAt(tmp, i-1, File.StringNextChar(tmp[0]));
                                tmp = File.StringReplaceAt(tmp, i, 'A');
                            }
                        }
                    }
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

File.findFileByName = function(filename, fn) {
    db.file.findOne({
        name: filename
    }, fn);
};

File.findFilesByGroup = function(group, fn) {
    db.file.find({
        'Rights.GroupRW' : group
    }, fn);
};

File.filenameValidate = function(filename, fn) {
    File.findFileByName(filename, function(err, file) {
        if (err) return fn(err);
        if (file) return fn(null, true);
        return fn(null, false);
    });
};

File.validFilenames = function(user, fn) {
    if (user.group.length == 0) return fn(new Error('用户未分组!'));
    File.findFilesByGroup(user.group[0], function(err, files) {
        if (err) return fn(err);
        var filenames = [];
        if (!files) return fn(null, filenames);
        files.forEach(function(file) {
            filenames.push(file.name);
        });
        fn(null, filenames);
    });
};

module.exports = File;
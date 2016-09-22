/**
 * Created by Lenovo on 2016/8/26.
 */

angular.module('AdminApp').controller('TableCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$q', 'Base64',
    'navbarInterface',
    function ($rootScope, $scope, $http, $timeout, $q, Base64, navbarInterface) {

    $scope.editing = false;

    var displaySuccessPanel = function() {
        $('#tablePanel').removeClass('panel-danger');
        $('#tablePanel').addClass('panel-success');
    };

    var displayErrorPanel = function() {
        $('#tablePanel').removeClass('panel-success');
        $('#tablePanel').addClass('panel-danger');
    };

    var errorDialog = function(title, msg, fn) {
        BootstrapDialog.confirm({
            title: title,
            type: BootstrapDialog.TYPE_DANGER,
            message: msg,
            btnCancelLabel: '取消',
            btnOKLabel: '确认',
            callback: fn
        });
    };

    var msgDialog = function(title, msg) {
        BootstrapDialog.show({
            title: title,
            message: msg,
            buttons: [{
                label: '关闭',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
    };

    $scope.addNewSheetq = function(sheetname) {
        var deferred = $q.defer();
        if (!validSheetname(sheetname)) {
            deferred.reject('重复的分页名 : [ <strong>'+ sheetname + '</strong> ]');
            return deferred.promise;
        }
        $scope.addNewSheet(sheetname);
        deferred.resolve('新分页[ <strong>'+ sheetname +'</strong> ]创建成功!');
        return deferred.promise;
    };

    $scope.inputDialog = function(title, msg, fn) {
        BootstrapDialog.show({
            title: title,
            message: msg + ':' + '<input type="text" class="form-control">',
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            buttons: [{
                    id: 'close',
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                },
                {
                    id : 'confirm',
                    label: '确认',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var input = dialog.getModalBody().find('input').val();
                        if (fn) {
                            fn(input).then(function(result) {
                                dialog.setMessage(result);
                            }).catch(function(err) {
                                dialog.setMessage(err);
                                dialog.setType(BootstrapDialog.TYPE_DANGER)
                            }).finally(function() {
                                dialog.getButton('confirm').remove();
                            });

                        }
                    }
                }
            ]
        });
    };

    $scope.confirmDialog = function(title, msg, fn) {
        BootstrapDialog.confirm({
            title: title,
            message: msg,
            btnCancelLabel: '取消',
            btnOKLabel: '确认',
            callback: fn
        });
    };


    $scope.edit = function() {
        $http({
            url: '/Admin/api/auth/requestEditFile',
            method: 'POST',
            params : {filename: $scope.file.name},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(file) {
            displayErrorPanel();

            $scope.editing = true;
            msgDialog('成功','请求编辑成功! 您可以开始修改文档了!');
            $scope.file = file;
            $scope.file.locked = $rootScope.me.user
            $scope.showSheet($scope.currentSheetname);

        }).error(function(err) {
            errorDialog('错误',err.err);
        }).then(function(){
            $scope.showSheet($scope.currentSheetname);
            navbarInterface.getfiles();
        });

    };



    $scope.save = function() {

            var file = angular.copy($scope.file);
            file.Sheets.forEach(function(sheet) {
                var lenMap = {};
                var rowDatas = sheet.rowDatas;
                rowDatas.forEach(function(one) {
                    for (var prop in one) {
                        var len = one[prop].toString().length;
                        len = len * 20;
                        lenMap[prop] = lenMap[prop] ?  (len > lenMap[prop] ? len : lenMap[prop]) : len ;
                    }
                });
                var columnDefs = sheet.columnDefs;
                columnDefs.forEach(function(col) {
                    col.width = lenMap[col.field] ? lenMap[col.field] : 20;
                });
            });
            file.MUser = $rootScope.me.user;
            file.MTime = Date.now();
            file.locked = 'unlocked';

        var fd = new FormData();

        fd.append('file', JSON.stringify(file));

        $http.post('/Admin/api/auth/updateFile', fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result){
            displaySuccessPanel();

            $scope.editing = false;
            $scope.file = file;
            $scope.file.locked = 'unlocked';
            msgDialog('成功', result.result);
        }).error(function(result) {
            errorDialog('错误', err.err);
        }).finally(function() {
            $scope.showSheet($scope.currentSheetname);
            navbarInterface.getfiles();
        });

    };


    $scope.gridOptions = {
        enableFiltering : true,
        enableGridMenu: true,
        enableColumnResizing: true,
        showGridFooter: true,
        exporterMenuCsv: true,
        exporterMenuPdf: false,
        minRowsToShow : 20,
        paginationPageSizes: [10, 20, 40, 60, 80],
        paginationPageSize: 20
    };



    $scope.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;


        gridApi.edit.on.beginCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.$apply();
            if (!$scope.editing) {
                errorDialog('错误','请点击编辑按钮!');
            }
        });

    };

    $scope.showSheet = function(sheetname) {
        for (var i = 0, len = $scope.file.Sheets.length; i < len; ++i) {
            if (sheetname == $scope.file.Sheets[i].name) {
                $scope.gridOptions.columnDefs = $scope.file.Sheets[i].columnDefs;
                $scope.gridOptions.data = $scope.file.Sheets[i].rowDatas;
                break;
            }
        }
        $scope.currentSheetname = sheetname;
    };

    $scope.str2date = function(str) {
        return new Date(str).toLocaleString();
    };


    var loadFile = function(filename) {
        $http({
            url: '/Admin/api/auth/getfileByName',
            method: 'GET',
            params : {filename: filename},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            $scope.file = result;
            if (result.locked == $rootScope.me.user) {
                $scope.editing = true;
                $timeout(function() {

                    displayErrorPanel();
                }, 0)
            } else {
                $scope.editing = false;
                $timeout(function() {

                    displaySuccessPanel();
                }, 0)
            }
            if (result.Sheets.length != 0) {
                $scope.showSheet(result.Sheets[0].name);
            } else {

                $scope.gridOptions.columnDefs = [];
                $scope.gridOptions.data = [];
            }
        }).error(function(err) {
            errorDialog('错误',err.err);
        });
    };
    $rootScope.$on('loadFile', function(event, args) {
        loadFile(args);
    });


    $scope.nextChar = function(char) {                      //Ascii + 1
        if (char.length ==1)
            return String.fromCharCode(char[0].charCodeAt(0) + 1)
        return null;
    };

    var CharIncrement = function(char) {
        var len = char.length;
        if (char == 'Z'.repeat(len)) {
            return 'A'.repeat(len+1);
        } else if (len == 1) {
            return $scope.nextChar(char[0]);
        } else {
            for (var i = len - 1; i != 0; --i) {
                char = $scope.StringReplaceAt(char, i, $scope.nextChar(char[i]));
                if (char[i] == '[') {                // '[' == 'Z'.charCodeAt(0) + 1
                    char = $scope.StringReplaceAt(char, i-1, $scope.nextChar(char[i-1]));
                    char = $scope.StringReplaceAt(char, i, 'A');
                }
            }
            return char;
        }
    };

    $scope.StringReplaceAt = function(str, index, character) {
        return str = str.substr(0, index) + character + str.substr(index + character.length);
    };



    $scope.addColumn = function() {
        var currentSheet;
        for (var i = 0, sheets = $scope.file.Sheets, len = sheets.length; i < len; ++i) {
            if(sheets[i].name == $scope.currentSheetname) {
                currentSheet = sheets[i];
                break;
            }
        }

        var nextHeader = currentSheet.lastHeader ? CharIncrement(currentSheet.lastHeader) : 'A';
        currentSheet.lastHeader = nextHeader;
        currentSheet.columnDefs.push({field: nextHeader, width: 20});
    };

    $scope.removeColumn = function() {
        var currentSheet;
        for (var i = 0, sheets = $scope.file.Sheets, len = sheets.length; i < len; ++i) {
            if(sheets[i].name == $scope.currentSheetname) {
                currentSheet = sheets[i];
                break;
            }
        }

        var len = currentSheet.columnDefs.length;
        if (len > 1) {
            var preLastHeader = currentSheet.columnDefs[len-2].field;
            currentSheet.lastHeader = preLastHeader;
            currentSheet.columnDefs.pop();
        }
    };

    $scope.addRow = function() {
        var currentSheet;
        for (var i = 0, sheets = $scope.file.Sheets, len = sheets.length; i < len; ++i) {
            if(sheets[i].name == $scope.currentSheetname) {
                currentSheet = sheets[i];
                break;
            }
        }
        currentSheet.rowDatas.push({index: currentSheet.rowDatas.length + 1});
    };

    $scope.removeRow = function() {
        var currentSheet;
        for (var i = 0, sheets = $scope.file.Sheets, len = sheets.length; i < len; ++i) {
            if(sheets[i].name == $scope.currentSheetname) {
                currentSheet = sheets[i];
                break;
            }
        }

        currentSheet.rowDatas.pop();
    };


    var validSheetname = function(sheetname) {
        for (var i = 0, len = $scope.file.Sheets.length; i < len; ++i) {
            if (sheetname == $scope.file.Sheets[i].name) {
                return false;
            }
        }
        return true;
    };

    $scope.addNewSheet = function(sheetname) {
        var newSheet = {};
        newSheet.name = sheetname;
        //newSheet.lastHeader = 'A';
        newSheet.columnDefs = [{field: 'index', type: 'string', width: 20}];
        newSheet.rowDatas = [{index: 1}];
        $scope.file.Sheets.push(newSheet);
        $timeout(function() {
            $scope.showSheet(sheetname);
        }, 0);

    };



    $scope.removeCurrentSheet = function() {
        $scope.confirmDialog('删除分页', '确认删除分页[ <strong>' +$scope.currentSheetname + '</strong> ] ?',
            function(result) {
                if (result) {
                    var sheetname = $scope.currentSheetname;
                    $timeout(function () {
                        for (var i = 0, len = $scope.file.Sheets.length; i < len; ++i) {
                            if (sheetname == $scope.file.Sheets[i].name) {
                                $scope.file.Sheets.splice(i, 1);
                                $scope.gridOptions.columnDefs = [];
                                $scope.gridOptions.data = [];
                                break;
                            }
                        }
                    }, 0);
                } else {

                }
            });
    };

    $scope.cancelEditFile = function() {
        $scope.confirmDialog('取消修改', '确认放弃修改文件吗?', function(result) {
            if (result) {
                $http({
                    url: '/Admin/api/auth/cancelEditFile',
                    method: 'POST',
                    params : {filename: $scope.file.name},
                    headers: {
                        Authorization: 'Basic '
                        + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                    }
                }).success(function(result) {

                    displaySuccessPanel();
                    $scope.editing = false;
                    $scope.file.locked = 'unlocked';
                    $scope.showSheet($scope.currentSheetname);

                }).error(function(err) {
                    errorDialog('错误',err.err);
                }).then(function(){
                    navbarInterface.getfiles();
                });
            }
        });
    };


}]);




//end of file
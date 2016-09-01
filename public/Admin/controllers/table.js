/**
 * Created by Lenovo on 2016/8/26.
 */

angular.module('AdminApp').controller('TableCtrl', function ($rootScope, $scope, $http, $timeout, Base64) {

    $scope.editing = false;
    $scope.haveChange = false;

    $scope.error = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.class = 'alert-danger ';
        $scope.messagebox.style = { width: '300px',
        height: '20px',
            padding: '0 20px',
        margin: '0 0 0 0'};
    };

    $scope.message = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.class = 'alert-success';
        $scope.messagebox.style = { width: '300px',
            height: '20px',
            padding: '0 20px',
            margin: '0 0 0 0'};
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
            $('#tablePanel').removeClass('panel-success');
            $('#tablePanel').addClass('panel-danger');

            $scope.editing = true;
            $scope.error('请求编辑成功! 您可以开始修改文档了!');
            $scope.file = file;
            $scope.file.locked = $rootScope.me.user;
            $scope.showSheet($scope.currentSheetname);
        }).error(function(err) {
            $scope.error(err.err);
        });
        $rootScope.$broadcast('updateFilenames');
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
            $http({
                url: '/Admin/api/auth/updateFile',
                method: 'POST',
                params : {file: file},
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                $('#tablePanel').removeClass('panel-danger');
                $('#tablePanel').addClass('panel-success');

                $scope.editing = false;
                $scope.file = file;
                $scope.file.locked = 'unlocked';
                $scope.message(result.result);
            }).error(function(err) {
                $scope.error(err.err);
            });
            $rootScope.$broadcast('updateFilenames');
            $scope.haveChange = false;


    };


    $scope.gridOptions = {
        enableFiltering : true,
        enableGridMenu: true,
        enableColumnResizing: true,
        showGridFooter: true,
        //exporterMenuCsv: true,
        minRowsToShow : 26,
        paginationPageSizes: [15, 25, 50, 75, 100],
        paginationPageSize: 25
    };



    $scope.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;


        gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.$apply();
            if (!$scope.editing) {
                alert('请点击编辑按钮!');
            } else {
                $scope.haveChange = true;
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



    $scope.$on('loadFile', function(event, args) {
        $http({
            url: '/Admin/api/auth/fileByName',
            method: 'GET',
            params : {filename: args},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            $scope.file = result;
            if (result.locked == $rootScope.me.user) {
                $scope.editing = true;
                $timeout(function() {
                    $('#tablePanel').removeClass('panel-success');
                    $('#tablePanel').addClass('panel-danger');
                }, 0)
            }
            if (result.Sheets.length != 0) {
                $scope.showSheet(result.Sheets[0].name);
            }
        }).error(function(err) {
            alert(err.err);
        });
    });


    $scope.nextChar = function(char) {                      //Ascii + 1
        if (char.length ==1)
            return String.fromCharCode(char[0].charCodeAt(0) + 1)
        return null;
    };

    $scope.CharIncrement = function(char) {
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

        var nextHeader = $scope.CharIncrement(currentSheet.lastHeader);
        currentSheet.lastHeader = nextHeader;
        currentSheet.columnDefs.push({field: nextHeader, width: 20});
    }

    $scope.removeColumn = function() {
        var currentSheet;
        for (var i = 0, sheets = $scope.file.Sheets, len = sheets.length; i < len; ++i) {
            if(sheets[i].name == $scope.currentSheetname) {
                currentSheet = sheets[i];
                break;
            }
        }

        var len = currentSheet.rowDatas.length;
        var preLastHeader = currentSheet.columnDefs[len-2].field;
        currentSheet.lastHeader = preLastHeader;
        currentSheet.columnDefs.pop();
    }
});
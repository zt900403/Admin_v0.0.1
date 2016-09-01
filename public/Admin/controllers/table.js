/**
 * Created by Lenovo on 2016/8/26.
 */

angular.module('AdminApp').controller('TableCtrl', function ($rootScope, $scope, $http, $timeout, Base64) {

    $scope.editing = false;



    $scope.edit = function() {
        $scope.editing = true;
        $('#tablePanel').removeClass('panel-success');
        $('#tablePanel').addClass('panel-danger');

        $http({
            url: '/Admin/api/auth/requestEditFile',
            method: 'POST',
            params : {filename: $scope.file.name},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            alert(result.result);
        }).error(function(err) {
            alert(err.err);
        });

    };

    $scope.save = function() {
        $scope.editing = false;
        $('#tablePanel').removeClass('panel-danger');
        $('#tablePanel').addClass('panel-success');

        $http({
            url: '/Admin/api/auth/completeEditFile',
            method: 'POST',
            params : {filename: $scope.file.name},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            alert(result.result);
        }).error(function(err) {
            alert(err.err);
        });
    };

    $scope.gridOptions = {
        enableFiltering : true,
        enableGridMenu: true,
        enableColumnResizing: true,
        showGridFooter: true,
        exporterMenuCsv: true,
        minRowsToShow : 15,
        paginationPageSizes: [15, 25, 50, 75],
        paginationPageSize: 15
    };


    $scope.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;


        gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.$apply();
            if (!$scope.editing) {
                alert('请点击编辑按钮!');
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
            if (result.Sheets.length != 0) {
                $scope.gridOptions.columnDefs = result.Sheets[0].columnDefs;
                $scope.gridOptions.data = result.Sheets[0].rowDatas;
            }
        }).error(function(err) {
            alert(err.err);
        });
    });


});
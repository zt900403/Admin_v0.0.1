/**
 * Created by Lenovo on 2016/8/26.
 */

angular.module('AdminApp').controller('TableCtrl', function ($rootScope, $scope, $http, Base64) {


    $scope.gridOptions = {
        enableFiltering : true,
        enableGridMenu: true,
        enableColumnResizing: true,
        //showGridFooter: true,
        exporterMenuCsv: true,

        enableCellSelection: true,
        minRowsToShow : 15,
        paginationPageSizes: [15, 25, 50, 75],
        paginationPageSize: 15
    };

    $scope.gridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            $scope.$apply();
            alert('变化的行:' +　colDef.name + '\n变化内容:' + oldValue + ' => '+ newValue );
        });
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
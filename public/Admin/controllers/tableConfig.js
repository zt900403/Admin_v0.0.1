/**
 * Created by Lenovo on 2016/8/29.
 */

angular.module('AdminApp').controller('TableConfigCtrl', ['$rootScope', '$scope', '$http', 'Base64',
    'navbarInterface',
    function ($rootScope, $scope, $http, Base64, navbarInterface) {

    $scope.filenames = navbarInterface.filenames;
    $scope.submit = function() {
        if ($scope.fileuploadChecked) {
            var fd = new FormData();
            fd.append('name', $scope.name);
            fd.append('file', $scope.myFiles);

            $http.post('/Admin/api/auth/uploadFile', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Authorization': 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result){
                confirmDialog('成功',result.result);
                navbarInterface.getfiles();
            }).error(function(result) {
                confirmDialog('失败',result.err);
            }).finally(function() {
                navbarInterface.getfiles();
            });
        } else {
            $http({
                url: '/Admin/api/auth/createBlankFile',
                method: 'POST',
                params : {filename: $scope.name},
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                confirmDialog('成功',result.result);
            }).error(function(err) {
                errorDialog('失败',err.err);
            }).finally(function() {
                navbarInterface.getfiles();
            });
        }
    };

    confirmDialog = function(title, msg, fn) {
        BootstrapDialog.confirm({
            title: title,
            message: msg,
            btnCancelLabel: '取消',
            btnOKLabel: '确认',
            callback: fn
        });
    };
    errorDialog = function(title, msg, fn) {
        BootstrapDialog.confirm({
            title: title,
            type: BootstrapDialog.TYPE_DANGER,
            message: msg,
            btnCancelLabel: '关闭',
            callback: fn
        });
    };


    $scope.deleteFileSubmit = function() {
        confirmDialog('确认删除', '确认删除 ' + '[ <strong>' + $scope.deleteFiles + '</strong> ]?', function(result) {
            if (result) {
                $http({
                    url: '/Admin/api/auth/removeFiles',
                    method: 'POST',
                    params : {filenames: $scope.deleteFiles},
                    headers: {
                        Authorization: 'Basic '
                        + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                    }
                }).success(function(result) {

                }).error(function(err) {

                }).finally(function() {
                    navbarInterface.getfiles();
                });
            }
        });
    };
}]);
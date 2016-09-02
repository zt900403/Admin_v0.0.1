/**
 * Created by Lenovo on 2016/8/29.
 */

angular.module('AdminApp').controller('TableConfigCtrl', function ($rootScope, $scope, $http, Base64) {

    $scope.error = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.class = 'alert-danger';
    };

    $scope.message = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.class = 'alert-success';
    };

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
                $scope.message(result.result);
                $rootScope.$broadcast('updateFilenames', null);
            }).error(function(result) {
                $scope.error(result.err);
            }).finally(function() {
                $rootScope.$broadcast('updateFilenames');
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
               $scope.message(result.result);
            }).error(function(err) {
               $scope.error(err.err);
            }).finally(function() {
                $rootScope.$broadcast('updateFilenames');
            });
        }
    }
});
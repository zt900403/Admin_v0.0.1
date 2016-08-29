/**
 * Created by Lenovo on 2016/8/29.
 */
angular.module('AdminApp').controller('TableConfigCtrl', function ($rootScope, $scope, $http, Base64) {
    $scope.submit = function() {
            var fd = new FormData();
            fd.append('file[name]', $scope.file.name);
            fd.append('file[body]', $scope.file.body);

            $http.post('/Admin/api/auth/uploadFile', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Authorization': 'Basic '
                        + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(){

            }).error(function(){

            });
        }
});
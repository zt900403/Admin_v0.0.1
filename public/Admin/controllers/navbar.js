/**
 * Created by Lenovo on 2016/8/29.
 */
angular.module('AdminApp').controller('NavbarCtrl', function ($rootScope, $scope, $http, $location, Base64 ) {
    $scope.initMetisMenu = function() {
        $('#side-menu').metisMenu();
    };

    $scope.logout = function() {
        if ($rootScope.me) {

            $http({
                url: '/Admin/api/auth/logout',
                method: 'POST',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function() {
                delete $rootScope.me;
                $location.path('/login');
            }).error(function(err) {
                alert(err);
            });
        } else {
            $location.path('/login');
        }
    };

    $scope.$on('updateFilenames', function(event, args) {

    });

    $scope.getFilenames = function() {
        $http({
            url: '/Admin/api/auth/validFilenames',
            method: 'GET',
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            $scope.filenames = result;
        }).error(function(err) {
            alert(err.err);
        });
    };


});
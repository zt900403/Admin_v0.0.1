/**
 * Created by Lenovo on 2016/8/29.
 */
angular.module('AdminApp').controller('NavbarCtrl', function ($rootScope, $scope, $http, $location, Base64, $timeout ) {
    $scope.initMetisMenu = function() {
        $('#side-menu').metisMenu();
    };

    $scope.siderNavBarInit = function() {
        if ($rootScope.me)
            $scope.updateFilenames();
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

    $scope.updateFilenames = function() {
        $http({
            url: '/Admin/api/auth/validFilenamesAndLock',
            method: 'GET',
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            $rootScope.files = result;
        }).error(function(err) {
            alert(err.err);
        });
    };

    $scope.loadFile = function(filename) {
        $timeout(function(){
            $rootScope.$broadcast('loadFile', filename);
        }, 0);
    };

    $scope.$on('updateFilenames', function(event, args) {
        $scope.updateFilenames();
    });


});
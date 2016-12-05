/**
 * Created by Lenovo on 2016/8/29.
 */

angular.module('navbar').controller('NavbarCtrl', ['$rootScope', '$scope', '$http', '$location', 'Base64',
    '$timeout','navbarInterface',
    function ($rootScope, $scope, $http, $location, Base64, $timeout, navbarInterface ) {


    $scope.initMetisMenu = function() {
        $('#side-menu').metisMenu();
    };



    $scope.siderNavBarInit = function() {
        if ($rootScope.me) {
            navbarInterface.setUserAndPasswd($rootScope.me.user, $rootScope.me.PWD);
            navbarInterface.getfiles();
            $scope.files = navbarInterface.files;

        }

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



    $scope.loadFile = function(filename) {
        $timeout(function(){
            $rootScope.$emit('loadFile', filename);
        }, 0);
    };

    $scope.isIncludes = function(array, element) {
        if (!array) {
            return false;
        }
        return array.indexOf(element) !== -1;
    };

}]);
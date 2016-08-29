/**
 * Created by Lenovo on 2016/8/29.
 */
angular.module('AdminApp').controller('NavbarCtrl', function ($rootScope, $scope, $http, $location ) {
    $scope.initMetisMenu = function() {
        $('#side-menu').metisMenu();
    };
});
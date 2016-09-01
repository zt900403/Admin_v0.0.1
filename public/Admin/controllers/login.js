/**
 * Created by Lenovo on 2016/8/26.
 */
angular.module('AdminApp').controller('LoginCtrl', function ($rootScope, $scope, $http, $location ) {

    if ($rootScope.me) {                //already login
        $location.path('/');
    }

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

    $scope.login = function() {
        $http({
            url: '/Admin/api/login',
            method: 'POST',
            data: {
                user: $scope.user
            }
        }).success(function(user){
            $rootScope.me = user;
            $location.path('/');
        }).error(function(err) {
            $scope.error(err.err);
        });
    };
});

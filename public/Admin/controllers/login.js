/**
 * Created by Lenovo on 2016/8/26.
 */
angular.module('AdminApp').controller('LoginCtrl', function ($rootScope, $scope, $http, $location ) {
    $scope.error = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.style = 'alert-danger';
    };

    $scope.message = function (msg) {
        $('#messagebox').removeClass('hide');
        $scope.messagebox = {};
        $scope.messagebox.message = msg;
        $scope.messagebox.style = 'alert-success';
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
            $scope.error(err);
        });
    };
});

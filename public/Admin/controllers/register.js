/**
 * Created by Lenovo on 2016/8/26.
 */
angular.module('AdminApp').controller('RegisterCtrl', function ($scope, $http, $location, $timeout) {

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


    $scope.register = function () {

        var user = $scope.user;

        if (user.user.length < 4) {
            $scope.error('帐号长度小于4!');
        } else if (user.PWD.length < 6) {
            $scope.error('密码长度小于6!');
        } else if (user.PWD !== user.PWD2) {
            $scope.error('两次密码输入不一致!');
        } else {
            $http({
                url: '/Admin/api/signin',
                method: 'POST',
                data: {
                    user: $scope.user
                }
            }).success(function(result) {
                $scope.message('注册成功! 2秒后跳转到登陆页面! 您也可以手动跳转!');
                $timeout(function() {
                    $location.path('/login');
                }, 2000);
            }).error(function(err) {
                if (err.err == 'User already exists') {
                    $scope.error('用户名已存在,请更换一个用户名!');
                } else {
                    $scope.error(err);
                }

                $location.path('/register')
            });

        }

    }

});

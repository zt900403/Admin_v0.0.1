/**
 * Created by Lenovo on 2016/9/21.
 */
angular.module('AdminApp').controller('UsersAuthCtrl', ['$rootScope', '$scope','$http', 'Base64', 'Dialog',

    function ($rootScope, $scope, $http, Base64, Dialog) {
        var getAllUsersRole = function() {
            $http({
                url: '/Admin/api/auth/getAllUsersAndRoles',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                $scope.users = result.users;
                $scope.rolesname = result.rolesname;
            }).error(function(err) {
                Dialog.errorDialog('失败', err.err);
            });
        };

        $scope.updateUser = function(user) {
            var one = {};
            one.user = user.user;
            one.role = user.role;
            one.group = user.group;
            var fd = new FormData();

            fd.append('user', JSON.stringify(one));

            $http.post('/Admin/api/auth/updateUser', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Authorization': 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                Dialog.confirmDialog('成功', result.result);
            }).error(function(err) {
                Dialog.errorDialog('失败', err.err);
            });
        };

        getAllUsersRole();
}]);
//end of file
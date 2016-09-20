/**
 * Created by Lenovo on 2016/9/20.
 */
angular.module('AdminApp').controller('RoleEditCtrl', ['$rootScope', '$scope','$http', '$timeout', 'Base64', 'Dialog',

    function ($rootScope, $scope, $http, $timeout, Base64, Dialog) {

    var initChosen = function() {
        $('.chosen-select').chosen({width: "100%"});
    };

    var getAllRoles = function() {
        $http({
            url: '/Admin/api/auth/getAllRoles',
            method: 'GET',
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(roles) {
            $scope.Roles = roles;
        }).error(function(err) {
            Dialog.errorDialog('失败', err.err);
        });
    };
    var getAllActiveFilenames = function() {
        $http({
            url: '/Admin/api/auth/getAllActiveFilenames',
            method: 'GET',
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(filenames) {
            $scope.filenames = filenames;
            $timeout(function() {
                initChosen();
            }, 0);
        }).error(function(err) {
            Dialog.errorDialog('失败', err.err);
        });
    };



        $scope.createNewRoleSubmit = function() {
        $http({
            url: '/Admin/api/auth/createNewRole',
            method: 'POST',
            params : {rolename: $scope.newRolename},
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            Dialog.confirmDialog('成功', result.result);
        }).error(function(err) {
            Dialog.errorDialog('失败', err.err);
        });
    };

    $scope.editRoleSubmit = function() {
        alert('editRole');
    };

    getAllActiveFilenames();
    getAllRoles();
}]);
//end of file
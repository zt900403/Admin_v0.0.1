/**
 * Created by Lenovo on 2016/9/20.
 */
angular.module('AdminApp').controller('RoleEditCtrl', ['$rootScope', '$scope','$http', '$timeout', 'Base64', 'Dialog',

    function ($rootScope, $scope, $http, $timeout, Base64, Dialog) {



    var getRolesOthersAndFilenames = function() {
        $http({
            url: '/Admin/api/auth/getRolesOthersAndFilenames',
            method: 'GET',
            headers: {
                Authorization: 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            $scope.Roles = result.roles;
            $scope.filenames = result.filenames;
            $scope.othersTemplate = result.others;

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
            getRolesOthersAndFilenames();
        }).error(function(err) {
            Dialog.errorDialog('失败', err.err);
        });
    };

    var getRolebyName = function(name) {
        var result;
        $scope.Roles.forEach(function(role) {
           if (role.name === name) {
               result = role;
           }
        });
        return result;
    };

    $scope.saveRoleSubmit = function() {
        var role = {};
        role.name = $scope.selectedRolename;
        role.fileReader = $scope.fileReader;
        role.fileWriter = $scope.fileWriter;
        role.others = $scope.others;
        var fd = new FormData();

        fd.append('role', JSON.stringify(role));

        $http.post('/Admin/api/auth/saveRole', fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'Authorization': 'Basic '
                + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
            }
        }).success(function(result) {
            Dialog.confirmDialog('成功', result.result);
            getRolesOthersAndFilenames();
        }).error(function(err) {
            Dialog.errorDialog('失败', err.err);
        });
    };

    $scope.selectRole = function() {
        var role = getRolebyName($scope.selectedRolename);
        $scope.fileReader = role.fileReader;
        $scope.fileWriter = role.fileWriter;
        $scope.others = role.others;

    };

    $scope.isSelected = function(element, array) {
        var a = array.indexOf(element);
        return a !== -1;
    };

    getRolesOthersAndFilenames();
}]);
//end of file
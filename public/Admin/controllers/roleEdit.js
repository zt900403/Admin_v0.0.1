/**
 * Created by Lenovo on 2016/9/20.
 */
angular.module('AdminApp').controller('RoleEditCtrl', ['$scope','$http', function ($scope, $http) {
    $scope.initChosen = function() {
        $('.chosen-select').chosen({});
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
            alert(result.result);
        }).error(function(err) {
            alert(err.err);
        });
    };

    $scope.editRoleSubmit = function() {
        alert('editRole');
    };
}]);
//end of file
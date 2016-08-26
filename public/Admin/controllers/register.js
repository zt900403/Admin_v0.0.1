/**
 * Created by Lenovo on 2016/8/26.
 */
angular.module('AdminApp').controller('RegisterCtrl', function ($scope, $http, $location) {
    $scope.register = function () {
        $scope.messagebox = {};
        $scope.messagebox.message='heihei';
        $scope.messagebox.style='alert-danger';


        /*
         $http({
         url: '/Admin/api/signin',
         method: 'POST',
         data: {
         user: $scope.user
         }
         }).success(function(result) {

         $location.path('/');
         }).error(function(err) {
         $location.path('/login')
         });
         */
    }

});

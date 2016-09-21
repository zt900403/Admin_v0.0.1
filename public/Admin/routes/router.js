angular.module('AdminApp').config(function($routeProvider) {

    $routeProvider.
    when('/', {
        templateUrl: '/Admin/pages/table.html',
        controller: 'TableCtrl'
    }).
    when('/login', {
        templateUrl: '/Admin/pages/login.html',
        controller: 'LoginCtrl'
    }).
    when('/register', {
        templateUrl: '/Admin/pages/register.html',
        controller: 'RegisterCtrl'
    }).
    when('/tableConfig', {
        templateUrl: '/Admin/pages/tableConfig.html',
        controller: 'TableConfigCtrl'
    }).
    when('/roleEdit', {
        templateUrl: '/Admin/pages/roleEdit.html',
        controller: 'RoleEditCtrl'
    }).when('/usersAuth',{
        templateUrl: '/Admin/pages/usersAuth.html',
        controller: 'UsersAuthCtrl'
    }).
    otherwise({
        redirectTo: '/login'
    });

});
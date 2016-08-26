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
        controller: 'LoginCtrl'
    }).
    otherwise({
        redirectTo: '/login'
    });

});
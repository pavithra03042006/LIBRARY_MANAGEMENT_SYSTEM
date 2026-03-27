angular.module('examApp', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            template: '<home-component></home-component>'
        })
        .when('/login', {
            template: '<login-component></login-component>'
        })
        .when('/register', {
            template: '<register-component></register-component>'
        })
        .when('/dashboard', {
            template: '<dashboard-component></dashboard-component>'
        })
        .when('/profile', {
            template: '<profile-component></profile-component>'
        })
        .when('/examlist', {
            template: '<examlist-component></examlist-component>'
        })
        .when('/myexams', {
            template: '<myexams-component></myexams-component>'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

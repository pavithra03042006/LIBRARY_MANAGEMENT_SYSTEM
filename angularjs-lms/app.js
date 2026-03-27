/**
 * lmsApp — AngularJS 1.x Library Management System
 * Module declaration + route configuration
 */
angular.module('lmsApp', ['ngRoute'])

  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix(''); // Fixes default #!/ routing to just #/
    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$location', function (AuthService, $location) {
            if (!AuthService.isAuthenticated()) {
              $location.path('/login');
            }
          }]
        }
      })
      .when('/books', {
        templateUrl: 'views/books.html',
        controller: 'BooksController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$location', function (AuthService, $location) {
            if (!AuthService.isAuthenticated()) {
              $location.path('/login');
            }
          }]
        }
      })
      .when('/members', {
        templateUrl: 'views/members.html',
        controller: 'MembersController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$location', function (AuthService, $location) {
            if (!AuthService.isAuthenticated()) {
              $location.path('/login');
            }
          }]
        }
      })
      .when('/transactions', {
        templateUrl: 'views/transactions.html',
        controller: 'TransactionsController',
        controllerAs: 'vm',
        resolve: {
          auth: ['AuthService', '$location', function (AuthService, $location) {
            if (!AuthService.isAuthenticated()) {
              $location.path('/login');
            }
          }]
        }
      })
      .otherwise({ redirectTo: '/login' });
  }])

  // Global run block — redirect unauthenticated users away from protected routes
  .run(['$rootScope', '$location', 'AuthService', 'StorageService',
    function ($rootScope, $location, AuthService, StorageService) {
      // Initialize localStorage with sample data on first run
      StorageService.initializeStore();

      $rootScope.$on('$routeChangeStart', function (event, next) {
        var isProtected = next && next.resolve && next.resolve.auth;
        if (isProtected && !AuthService.isAuthenticated()) {
          $location.path('/login');
        }
      });
    }
  ]);

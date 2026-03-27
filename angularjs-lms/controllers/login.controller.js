/**
 * LoginController — mirrors app/login page behaviour
 */
angular.module('lmsApp')
  .controller('LoginController', ['$scope', '$location', 'AuthService',
    function ($scope, $location, AuthService) {

      // Redirect if already logged in
      if (AuthService.isAuthenticated()) {
        $location.path('/dashboard');
      }

      $scope.credentials = { email: '', password: '' };
      $scope.error       = '';
      $scope.loading     = false;

      $scope.login = function () {
        $scope.loading = true;
        $scope.error   = '';

        var success = AuthService.login($scope.credentials.email, $scope.credentials.password);

        if (success) {
          $location.path('/dashboard');
        } else {
          $scope.error   = 'Invalid email or password.';
          $scope.loading = false;
        }
      };

      /** Quick-fill demo credentials */
      $scope.fillDemo = function (role) {
        var demos = {
          admin:     { email: 'admin@library.com',     password: 'admin123'     },
          librarian: { email: 'librarian@library.com', password: 'librarian123' },
          member:    { email: 'member@library.com',    password: 'member123'    }
        };
        if (demos[role]) {
          $scope.credentials = angular.copy(demos[role]);
        }
      };
    }
  ]);

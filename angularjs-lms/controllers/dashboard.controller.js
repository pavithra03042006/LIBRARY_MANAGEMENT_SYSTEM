/**
 * DashboardController — mirrors app/dashboard/page.tsx
 */
angular.module('lmsApp')
  .controller('DashboardController', ['$scope', '$location', 'AuthService', 'TransactionService', 'BookService', 'MemberService',
    function ($scope, $location, AuthService, TransactionService, BookService, MemberService) {

      $scope.currentUser        = AuthService.getCurrentUser();
      $scope.showNotif           = false;
      $scope.isActive = function(path) { return $location.path() === path; };
      $scope.stats              = TransactionService.getDashboardStats();
      $scope.recentTransactions = TransactionService.getTransactions().slice(-5).reverse();
      $scope.books              = BookService.getBooks();
      $scope.members            = MemberService.getMembers();

      $scope.lowStockBooks = $scope.books
        .filter(function (b) { return b.availableCopies <= 1; })
        .slice(0, 5);

      $scope.membersWithFines = $scope.members
        .filter(function (m) { return (m.totalFines - m.paidFines) > 0; });

      $scope.getBookTitle = function (id) {
        var b = $scope.books.find(function (b) { return b.id === id; });
        return b ? b.title : 'Unknown';
      };

      $scope.getMemberName = function (id) {
        var m = $scope.members.find(function (m) { return m.id === id; });
        return m ? m.name : 'Unknown';
      };

      $scope.pendingFine = function (member) {
        return (member.totalFines - member.paidFines).toFixed(2);
      };

      $scope.navigate = function (path) { $location.path(path); };

      $scope.logout = function () {
        AuthService.logout();
        $location.path('/login');
      };
    }
  ]);

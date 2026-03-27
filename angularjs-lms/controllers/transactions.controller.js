/**
 * TransactionsController — mirrors app/dashboard/transactions page
 */
angular.module('lmsApp')
  .controller('TransactionsController', ['$scope', '$location', 'AuthService',
    'TransactionService', 'BookService', 'MemberService',
    function ($scope, $location, AuthService, TransactionService, BookService, MemberService) {

      $scope.currentUser   = AuthService.getCurrentUser();
      $scope.showNotif     = false;
      $scope.isActive = function(path) { return $location.path() === path; };
      $scope.transactions  = [];
      $scope.books         = BookService.getBooks();
      $scope.members       = MemberService.getMembers();
      $scope.alert         = null;
      $scope.activeTab     = 'list'; // 'list' | 'issue' | 'return'

      // Issue form model
      $scope.issueForm = {
        bookId:   '',
        memberId: '',
        dueDate:  ''
      };

      // Return form model
      $scope.returnForm = {
        transactionId: ''
      };

      $scope.refresh = function () {
        TransactionService.updateOverdueTransactions();
        $scope.transactions = TransactionService.getTransactions().slice().reverse();
      };

      $scope.refresh();

      $scope.getBookTitle = function (id) {
        var b = $scope.books.find(function (b) { return b.id === id; });
        return b ? b.title : 'Unknown';
      };

      $scope.getMemberName = function (id) {
        var m = $scope.members.find(function (m) { return m.id === id; });
        return m ? m.name : 'Unknown';
      };

      // ── Issue ──────────────────────────────────────────────────────

      $scope.issueBook = function () {
        var f = $scope.issueForm;
        if (!f.bookId || !f.memberId || !f.dueDate) {
          $scope.showAlert('Please fill in all fields.', 'danger');
          return;
        }
        var tx = TransactionService.issueBook(f.bookId, f.memberId, f.dueDate);
        if (tx) {
          $scope.showAlert('Book issued successfully! Transaction ID: ' + tx.id, 'success');
          $scope.issueForm = { bookId: '', memberId: '', dueDate: '' };
          $scope.books = BookService.getBooks(); // refresh available copies
          $scope.refresh();
          $scope.activeTab = 'list';
        } else {
          $scope.showAlert('Book not available or not found.', 'danger');
        }
      };

      // ── Return ─────────────────────────────────────────────────────

      /** Populate return form from active transaction list */
      $scope.openReturn = function (tx) {
        $scope.returnForm.transactionId = tx.id;
        $scope.activeTab = 'return';
      };

      $scope.returnBook = function () {
        var txId = $scope.returnForm.transactionId;
        if (!txId) {
          $scope.showAlert('Please enter a transaction ID.', 'danger');
          return;
        }
        var tx = TransactionService.returnBook(txId);
        if (tx) {
          var msg = 'Book returned. ' + (tx.fine > 0 ? 'Fine: ₹' + tx.fine.toFixed(2) + ' (overdue).' : 'No fine.');
          $scope.showAlert(msg, tx.fine > 0 ? 'warning' : 'success');
          $scope.returnForm = { transactionId: '' };
          $scope.books   = BookService.getBooks();
          $scope.refresh();
          $scope.activeTab = 'list';
        } else {
          $scope.showAlert('Transaction not found.', 'danger');
        }
      };

      // ── Pay fine ───────────────────────────────────────────────────

      $scope.payFine = function (tx) {
        if (TransactionService.payFine(tx.id)) {
          $scope.showAlert('Fine of ₹' + tx.fine.toFixed(2) + ' marked as paid.', 'success');
          $scope.refresh();
          $scope.members = MemberService.getMembers();
        }
      };

      // ── Helpers ────────────────────────────────────────────────────

      $scope.activeTransactions = function () {
        return $scope.transactions.filter(function (t) {
          return t.status === 'issued' || t.status === 'overdue';
        });
      };

      $scope.showAlert = function (msg, type) {
        $scope.alert = { msg: msg, type: type };
        setTimeout(function () {
          $scope.$apply(function () { $scope.alert = null; });
        }, 4000);
      };

      $scope.setTab = function (tab) { $scope.activeTab = tab; };

      $scope.navigate = function (path) { $location.path(path); };

      $scope.logout = function () {
        AuthService.logout();
        $location.path('/login');
      };
    }
  ]);

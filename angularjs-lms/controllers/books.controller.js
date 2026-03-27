/**
 * BooksController — mirrors app/dashboard/books page
 */
angular.module('lmsApp')
  .controller('BooksController', ['$scope', '$location', 'AuthService', 'BookService',
    function ($scope, $location, AuthService, BookService) {

      $scope.currentUser  = AuthService.getCurrentUser();
      $scope.showNotif    = false;
      $scope.isActive = function(path) { return $location.path() === path; };
      $scope.canAdd      = AuthService.hasRole(['admin', 'librarian']);
      $scope.canDelete   = AuthService.hasRole(['admin']);
      $scope.isReadOnly  = AuthService.hasRole(['member']);
      $scope.searchQuery = '';
      $scope.books       = BookService.getBooks();
      $scope.showForm     = false;
      $scope.editMode     = false;
      $scope.alert        = null;

      // Form model
      $scope.form = {};

      $scope.refresh = function () {
        $scope.books = $scope.searchQuery
          ? BookService.searchBooks($scope.searchQuery)
          : BookService.getBooks();
      };

      $scope.search = function () { $scope.refresh(); };

      $scope.openAddForm = function () {
        $scope.form     = { totalCopies: 1, availableCopies: 1 };
        $scope.editMode = false;
        $scope.showForm = true;
      };

      $scope.openEditForm = function (book) {
        $scope.form     = angular.copy(book);
        $scope.editMode = true;
        $scope.showForm = true;
      };

      $scope.cancelForm = function () {
        $scope.showForm = false;
        $scope.form     = {};
      };

      $scope.parseCSV = function (text) {
        var lines = text.trim().split(/\r?\n/).filter(function (l) { return l.trim(); });
        if (lines.length < 2) return [];
        var headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase(); });
        return lines.slice(1).map(function (line) {
          var values = line.split(',').map(function (v) { return v.trim(); });
          var row = {};
          headers.forEach(function (header, idx) {
            row[header] = values[idx] || '';
          });
          return row;
        });
      };

      $scope.importBooksCSV = function (event) {
        if (!$scope.canAdd) {
          $scope.showAlert('You do not have permissions to import books.', 'danger');
          return;
        }
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          var rows = $scope.parseCSV(e.target.result);
          rows.forEach(function (row) {
            if (!row.title || !row.author) return;
            BookService.createBook({
              title: row.title,
              author: row.author,
              isbn: row.isbn || '',
              category: row.category || '',
              publisher: row.publisher || '',
              publishYear: Number(row.publishyear || row.publishYear || 0),
              totalCopies: Number(row.totalcopies || row.totalCopies || 1),
              availableCopies: Number(row.availablecopies || row.availableCopies || 1),
              location: row.location || ''
            });
          });
          $scope.$apply(function () {
            $scope.refresh();
            $scope.showAlert('Books imported successfully!', 'success');
          });
        };
        reader.readAsText(file);
        event.target.value = '';
      };

      $scope.triggerBooksCsvUpload = function () {
        document.getElementById('booksCsvInput').click();
      };

      $scope.saveBook = function () {
        if ($scope.editMode) {
          BookService.updateBook($scope.form.id, $scope.form);
          $scope.showAlert('Book updated successfully.', 'success');
        } else {
          BookService.createBook($scope.form);
          $scope.showAlert('Book added successfully.', 'success');
        }
        $scope.cancelForm();
        $scope.refresh();
      };

      $scope.deleteBook = function (book) {
        if (confirm('Delete "' + book.title + '"?')) {
          BookService.deleteBook(book.id);
          $scope.showAlert('Book deleted.', 'warning');
          $scope.refresh();
        }
      };

      $scope.showAlert = function (msg, type) {
        $scope.alert = { msg: msg, type: type };
        setTimeout(function () {
          $scope.$apply(function () { $scope.alert = null; });
        }, 3000);
      };

      $scope.navigate = function (path) { $location.path(path); };

      $scope.logout = function () {
        AuthService.logout();
        $location.path('/login');
      };
    }
  ]);

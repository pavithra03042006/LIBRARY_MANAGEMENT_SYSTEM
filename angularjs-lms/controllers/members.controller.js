/**
 * MembersController — mirrors app/dashboard/members page
 */
angular.module('lmsApp')
  .controller('MembersController', ['$scope', '$location', 'AuthService', 'MemberService',
    function ($scope, $location, AuthService, MemberService) {

      $scope.currentUser  = AuthService.getCurrentUser();
      $scope.showNotif    = false;
      $scope.isActive = function(path) { return $location.path() === path; };
      $scope.canAdd      = AuthService.hasRole(['admin', 'librarian']);
      $scope.canDelete   = AuthService.hasRole(['admin']);
      $scope.isReadOnly  = AuthService.hasRole(['member']);
      $scope.searchQuery = '';
      $scope.members     = MemberService.getMembers();
      $scope.showForm     = false;
      $scope.editMode     = false;
      $scope.alert        = null;

      $scope.form = {};

      var today = new Date();
      var nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);

      $scope.refresh = function () {
        $scope.members = $scope.searchQuery
          ? MemberService.searchMembers($scope.searchQuery)
          : MemberService.getMembers();
      };

      $scope.search = function () { $scope.refresh(); };

      $scope.openAddForm = function () {
        $scope.form = {
          status:         'active',
          membershipType: 'standard',
          joinDate:       today.toISOString().split('T')[0],
          expiryDate:     nextYear.toISOString().split('T')[0],
          totalFines:     0,
          paidFines:      0
        };
        $scope.editMode = false;
        $scope.showForm = true;
      };

      $scope.openEditForm = function (member) {
        $scope.form     = angular.copy(member);
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

      $scope.importMembersCSV = function (event) {
        if (!$scope.canAdd) {
          $scope.showAlert('You do not have permissions to import members.', 'danger');
          return;
        }
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          var rows = $scope.parseCSV(e.target.result);
          rows.forEach(function (row) {
            if (!row.name || !row.email) return;
            MemberService.createMember({
              name: row.name,
              email: row.email,
              phone: row.phone || '',
              address: row.address || '',
              membershipType: row.membershiptype || row.membershipType || 'standard',
              status: row.status || 'active',
              joinDate: row.joindate || row.joinDate || '',
              expiryDate: row.expirydate || row.expiryDate || '',
              totalFines: Number(row.totalfines || row.totalFines || 0),
              paidFines: Number(row.paidfines || row.paidFines || 0)
            });
          });
          $scope.$apply(function () {
            $scope.refresh();
            $scope.showAlert('Members imported successfully!', 'success');
          });
        };
        reader.readAsText(file);
        event.target.value = '';
      };

      $scope.triggerMembersCsvUpload = function () {
        document.getElementById('membersCsvInput').click();
      };

      $scope.saveMember = function () {
        if ($scope.editMode) {
          MemberService.updateMember($scope.form.id, $scope.form);
          $scope.showAlert('Member updated successfully.', 'success');
        } else {
          MemberService.createMember($scope.form);
          $scope.showAlert('Member added successfully.', 'success');
        }
        $scope.cancelForm();
        $scope.refresh();
      };

      $scope.deleteMember = function (member) {
        if (confirm('Delete member "' + member.name + '"?')) {
          MemberService.deleteMember(member.id);
          $scope.showAlert('Member deleted.', 'warning');
          $scope.refresh();
        }
      };

      $scope.pendingFine = function (member) {
        return (member.totalFines - member.paidFines).toFixed(2);
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

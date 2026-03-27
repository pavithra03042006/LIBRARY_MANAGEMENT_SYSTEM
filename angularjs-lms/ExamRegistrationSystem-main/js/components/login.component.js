angular.module('examApp')
.component('loginComponent', {
    templateUrl: 'templates/login.html',
    controller: ['authService', '$location', '$timeout', function(authService, $location, $timeout) {
        var ctrl = this;
        ctrl.user = {};
        ctrl.error = null;
        ctrl.successMsg = false;
        
        // Auto-dismiss alerts - handled by timeout in components instead of raw JS
        if ($location.search().success === 'true') {
            ctrl.successMsg = true;
            $timeout(function() {
                ctrl.successMsg = false;
            }, 5000);
        }

        ctrl.clearError = function() {
            ctrl.error = null;
        };

        ctrl.login = function() {
            if (!ctrl.user.email || !ctrl.user.password) {
                ctrl.error = 'empty';
                return;
            }
            authService.login(ctrl.user.email, ctrl.user.password)
                .then(function(response) {
                    // The old Servlet redirects to dashboard.jsp on success and login.jsp on failure.
                    // AngularJS $http transparently follows redirects and returns the HTML.
                    if (typeof response === 'string' && response.includes('Student Dashboard')) {
                        $location.path('/dashboard');
                    } else if (response && response.data && typeof response.data === 'string' && response.data.includes('Student Dashboard')) {
                        $location.path('/dashboard');
                    } else if (response && response.success) { // Fallback if backend is ever updated to JSON
                        $location.path('/dashboard');
                    } else {
                        ctrl.error = 'invalid';
                    }
                })
                .catch(function(err) {
                    ctrl.error = 'failed';
                });
        };
    }]
});

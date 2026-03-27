angular.module('examApp')
.component('registerComponent', {
    templateUrl: 'templates/register.html',
    controller: ['authService', '$location', function(authService, $location) {
        var ctrl = this;
        ctrl.user = {};
        ctrl.error = null;

        ctrl.register = function() {
            authService.register(ctrl.user)
                .then(function(response) {
                    var html = (typeof response === 'string') ? response : (response.data || '');
                    if (html.includes('Student Login') || (response.config && response.config.url.includes('login'))) {
                        $location.path('/login').search('success', 'true');
                    } else if (response && response.success) { // Fallback if backend is ever updated to JSON
                        $location.path('/login').search('success', 'true');
                    } else {
                        ctrl.error = 'database';
                    }
                })
                .catch(function(err) {
                    ctrl.error = 'database';
                });
        };
    }]
});

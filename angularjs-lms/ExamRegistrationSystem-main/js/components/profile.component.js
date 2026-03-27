angular.module('examApp')
.component('profileComponent', {
    templateUrl: 'templates/profile.html',
    controller: ['userService', 'authService', '$location', function(userService, authService, $location) {
        var ctrl = this;
        ctrl.profile = {};
        ctrl.currentDate = new Date();

        ctrl.$onInit = function() {
            userService.getProfile().then(function(profile) {
                if(profile) {
                    ctrl.profile = profile;
                }
            });
        };

        ctrl.logout = function() {
            authService.logout().then(function() {
                $location.path('/login');
            });
        };
    }]
});

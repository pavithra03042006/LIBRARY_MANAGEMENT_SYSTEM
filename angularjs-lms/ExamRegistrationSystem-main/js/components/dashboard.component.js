angular.module('examApp')
.component('dashboardComponent', {
    templateUrl: 'templates/dashboard.html',
    controller: ['userService', 'examService', 'authService', '$location', function(userService, examService, authService, $location) {
        var ctrl = this;
        
        ctrl.$onInit = function() {
            // Mock data - normally would come from services
            ctrl.studentName = "Student"; 
            ctrl.stats = {
                totalRegistrations: 0,
                upcomingExams: 0,
                completedExams: 0
            };
            ctrl.todayExams = [];
            ctrl.tomorrowExams = [];

            userService.getProfile().then(function(profile) {
                if (profile && profile.name) {
                    ctrl.studentName = profile.name;
                }
            });

            userService.getStats().then(function(stats) {
                if (stats) {
                    ctrl.stats = stats;
                }
            });
            
            // Further exam alert loading could go here
        };

        ctrl.logout = function() {
            if (confirm('Are you sure you want to logout?')) {
                authService.logout().then(function() {
                    $location.path('/login');
                });
            }
        };
    }]
});

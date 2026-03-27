angular.module('examApp')
.component('myexamsComponent', {
    templateUrl: 'templates/myexams.html',
    controller: ['examService', '$location', '$timeout', function(examService, $location, $timeout) {
        var ctrl = this;
        ctrl.upcomingExams = [];
        ctrl.completedExams = [];
        ctrl.error = false;
        ctrl.successMsg = false;

        ctrl.$onInit = function() {
            if ($location.search().cancel === 'true') {
                ctrl.successMsg = true;
                $timeout(function() {
                    ctrl.successMsg = false;
                }, 5000);
            }

            examService.getUpcomingExams().then(function(exams) {
                if(exams && angular.isArray(exams)) ctrl.upcomingExams = exams;
            }).catch(function() { ctrl.error = true; });

            examService.getCompletedExams().then(function(exams) {
                if(exams && angular.isArray(exams)) ctrl.completedExams = exams;
            }).catch(function() { ctrl.error = true; });
        };

        ctrl.cancelExam = function(regId) {
            if(confirm('Are you sure you want to cancel this registration?')) {
                // Mock cancel call
                $location.search('cancel', 'true');
                ctrl.$onInit();
            }
        };
    }]
});

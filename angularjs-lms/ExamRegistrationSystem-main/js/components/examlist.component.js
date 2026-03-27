angular.module('examApp')
.component('examlistComponent', {
    templateUrl: 'templates/examlist.html',
    controller: ['examService', function(examService) {
        var ctrl = this;
        ctrl.exams = [];
        ctrl.error = false;

        ctrl.$onInit = function() {
            examService.getAvailableExams().then(function(exams) {
                if(exams && angular.isArray(exams)) {
                    ctrl.exams = exams;
                } else {
                    // Start missing mocked data array to avoid undefined errors
                    ctrl.exams = [];
                }
            }).catch(function() {
                ctrl.error = true;
            });
        };

        ctrl.registerForExam = function(examId) {
            if(confirm('Are you sure you want to register for this exam?')) {
                examService.registerForExam(examId).then(function() {
                    ctrl.$onInit(); // refresh
                });
            }
        };
    }]
});

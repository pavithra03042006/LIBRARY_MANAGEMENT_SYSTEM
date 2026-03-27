angular.module('examApp')
.service('examService', ['$http', '$q', '$httpParamSerializerJQLike', function($http, $q, $httpParamSerializerJQLike) {
    this.getAvailableExams = function() {
        return $http.get('api/exams/available').then(function(response) {
            return response.data;
        });
    };

    this.getUpcomingExams = function() {
        return $http.get('api/exams/upcoming').then(function(response) {
            return response.data;
        });
    };

    this.getCompletedExams = function() {
        return $http.get('api/exams/completed').then(function(response) {
            return response.data;
        });
    };

    this.registerForExam = function(examId) {
        var data = $httpParamSerializerJQLike({ exam_id: examId });
        return $http({
            method: 'POST',
            url: 'RegisterExamServlet', // Mock endpoint
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(response) {
            return response.data;
        });
    };
}]);

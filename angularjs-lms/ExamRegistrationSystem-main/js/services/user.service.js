angular.module('examApp')
.service('userService', ['$http', '$q', '$httpParamSerializerJQLike', function($http, $q, $httpParamSerializerJQLike) {
    this.getProfile = function() {
        return $http.get('api/user/profile').then(function(response) {
            return response.data;
        });
    };

    this.updateProfile = function(profileData) {
        var data = $httpParamSerializerJQLike(profileData);
        return $http({
            method: 'POST',
            url: 'UpdateProfileServlet', // Mock endpoint
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(response) {
            return response.data;
        });
    };
    
    this.getStats = function() {
        return $http.get('api/user/stats').then(function(response) {
            return response.data;
        });
    };
}]);

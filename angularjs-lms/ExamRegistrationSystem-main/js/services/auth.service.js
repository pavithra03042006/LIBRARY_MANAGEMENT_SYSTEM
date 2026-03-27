angular.module('examApp')
.service('authService', ['$http', '$q', '$httpParamSerializerJQLike', function($http, $q, $httpParamSerializerJQLike) {
    this.login = function(email, password) {
        var deferred = $q.defer();
        var data = $httpParamSerializerJQLike({
            email: email,
            password: password
        });
        
        $http({
            method: 'POST',
            url: 'LoginServlet',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(response) {
            deferred.resolve(response.data);
        }).catch(function(error) {
            deferred.reject(error);
        });
        
        return deferred.promise;
    };

    this.register = function(userData) {
        var deferred = $q.defer();
        var data = $httpParamSerializerJQLike(userData);
        
        $http({
            method: 'POST',
            url: 'RegisterServlet',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(response) {
            deferred.resolve(response.data);
        }).catch(function(error) {
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
    this.logout = function() {
        return $http.get('LogoutServletStudent');
    };
}]);

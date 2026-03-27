angular.module('examApp')
.component('homeComponent', {
    templateUrl: 'templates/home.html',
    controller: function() {
        this.currentYear = new Date().getFullYear();
    }
});

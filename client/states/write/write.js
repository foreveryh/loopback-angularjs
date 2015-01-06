angular.module('Shu.write', ['ui.bootstrap','ui.utils','ui.router','ngAnimate','textAngular']);

angular.module('Shu.write').config(function($stateProvider) {

	$stateProvider.state('write', {
 		url: '/write',
    templateUrl: 'states/write/write.html'
  });

});


angular.module('Shu.home', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('Shu.home').config(function($stateProvider) {

    /* Add New States Above */
    $stateProvider.state( 'recommend', {
   		url: '/home',
      templateUrl: 'states/home/recommend.html'
    })
    .state('hottest', {
      url: '/hottest',
      templateUrl: 'states/home/hottest.html'
    });
});


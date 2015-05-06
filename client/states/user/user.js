angular.module('Shu.user', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'angular-ladda']);

angular.module('Shu.user').config(function($stateProvider) {

  $stateProvider.state('account', {
    abstract: true,
    url: '/account',
    templateUrl: 'states/user/account.html'
  }).state('account.login', {
    url: '/login',
    templateUrl: 'states/user/login.html'
  }).state('account.sign_up', {
    url: '/sign_up',
    templateUrl: 'states/user/sign_up.html'
  });
});
angular.module('Shu.user').controller(function() {

});
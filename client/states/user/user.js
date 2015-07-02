angular.module('Shu.user', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'angular-ladda']);

angular.module('Shu.user').config(function($stateProvider) {

  $stateProvider.state('account', {
    abstract: true,
    url: '/account',
    templateUrl: 'states/user/account.html'
  }).state('account.login', {
    url: '/login',
    templateUrl: 'states/user/login.html',
    data: {login: true}
  }).state('account.sign_up', {
    url: '/sign_up',
    templateUrl: 'states/user/sign_up.html',
    data: {public: true}
  }).state('account.find_password', {
    url: '/find_password',
    templateUrl: 'states/user/request_reset_password.html',
    data: {public: true}
  }).state('account.reset_password',{
    url: '/reset_password?access_token',
    templateUrl: 'states/user/reset_password.html',
    data: {public: true},
    controller: function($stateParams, $scope){
      console.log($stateParams);
      if ($stateParams.access_token){
        $scope.accessToken = $stateParams.access_token;
      }
    } 
  });
});
angular.module('Shu.user').controller(function() {

});

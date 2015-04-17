angular.module('Shu', ['lbServices', 'ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'Shu.home', 'Shu.page', 'Shu.write', 'Shu.notebook']);
//Modal window with custom URL in AngularJS
//http://stackoverflow.com/questions/24713242/using-ui-router-with-bootstrap-ui-modal
angular.module('Shu')
  .provider('modalState', function($stateProvider) {
    var provider = this;
    this.$get = function() {
      return provider;
    }
    this.state = function(stateName, options) {
      var modalInstance;
      $stateProvider.state(stateName, {
        url: options.url,
        onEnter: function($modal, $state) {
          modalInstance = $modal.open(options);
          modalInstance.result['finally'](function() {
            modalInstance = null;
            if ($state.$current.name === stateName) {
              $state.go('^');
            }
          });
        },
        onExit: function() {
          if (modalInstance) {
            modalInstance.close();
          }
        }
      });
    };
  })
angular.module('Shu').config(function($stateProvider, modalStateProvider, $urlRouterProvider, LoopBackResourceProvider) {

  $urlRouterProvider.otherwise('');
  modalStateProvider.state('login', {
    url: '/login',
    templateUrl: 'login.html'
  });
  // Change the URL where to access the LoopBack REST API server
  LoopBackResourceProvider.setUrlBase('http://0.0.0.0:3000/api');
});

angular.module('Shu').run(function($rootScope) {

  $rootScope.safeApply = function(fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});

angular.module('Shu', ['lbServices', 'ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'Shu.home', 'Shu.page']);

angular.module('Shu').config(function($stateProvider, $urlRouterProvider, LoopBackResourceProvider) {

    $urlRouterProvider.otherwise('/home');
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

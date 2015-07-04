angular.module('Shu').directive('navbarDirective', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		templateUrl: 'common/directives/navbar-directive/navbar-directive.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
angular.module('Shu').directive('navbarUserDirective', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		templateUrl: 'common/directives/navbar-directive/navbar-user-directive.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});

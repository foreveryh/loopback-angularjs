angular.module('Shu.home').directive('articleSummaryDirective', function($state) {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: function(){
			var tpl = $state.current.name;
			return 'common/directives/article-summary-directive/article-summary-' + tpl + '.html';
		},
		link: function(scope, element, attrs, fn) {


		}
	};
});

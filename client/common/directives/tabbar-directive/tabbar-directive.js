angular.module('Shu').directive('tabbarDirective', function($state) {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		controller: function($scope){
			$scope.templateUrl = '';
			var tabs = $scope.tabs = [];
			var controller = this;
			
			this.selectTab = function(tab){
				angular.forEach(tabs, function(tab){
					tab.selected = false;
				});
				tab.selected = true;
			};

			this.setTabTemplate = function(templateUrl){
				$scope.templateUrl = templateUrl;
			};

			this.addTab = function(tab){
				if (tabs.length == 0) {
					controller.selectTab(tab);
				}
				tabs.push(tab);
			};
		},
		templateUrl: function() {
			var tpl = $state.current.name;
			return 'common/directives/tabbar-directive/tabbar-directive.html';
		},
		link: function(scope, element, attrs, fn) {

		}
	};
})
.directive('tabDirective', function(){
	return {
		restrict: 'E',
		replace: true,
		require: '^tabbarDirective',
		scope: {
			title: '@',
			templateUrl: '@'
		},
		link: function(scope, element, attrs, tabsetController){
			tabsetController.addTab(scope);
			
			scope.select = function (){
				tabsetController.selectTab(scope);
			}

			scope.$watch('selected', function(){
				if (scope.selected) {
					tabsetController.setTabTemplate(scope.templateUrl);
				}
			});
		},
		template:
			'<li ui-sref-active="active">' +
        '<a href="" ng-click="select()">{{ title }}</a>' +
      '</li>'
	};
});
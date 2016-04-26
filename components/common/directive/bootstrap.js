/**
 * Bootstrap tooltip directive.
 */

(function () {
	'use strict';

	function izendaBootstrapCollapse($timeout) {
		return {
			restrict: 'A',
			scope: {
				collapsed: '=',
				useDelay: '='
			},
			link: function ($scope, element) {
				var $element = angular.element(element);
				$element.addClass('collapse');
				if ($scope.collapsed) {
					$element.addClass('in');
				}
				$element.collapse();
				$scope.$watch('collapsed', function () {
					if ($scope.useDelay) {
						$timeout(function () {
							$element.collapse($scope.collapsed ? 'hide' : 'show');
						}, 1000);
					} else {
						$element.collapse($scope.collapsed ? 'hide' : 'show');
					}
				});
			}
		}
	}

	// implementation
	function izendaBootstrapTooltip() {
		return {
			restrict: 'A',
			scope: {
				tooltipItems: '='
			},
			link: function (scope, element, attrs) {
				var $element = angular.element(element);
				scope.$watch('tooltipItems', function (newVal) {
					if (!angular.isArray(newVal)) {
						$element.attr('title', '');
						return;
					}
					var result = '';
					for (var i = 0; i < newVal.length; i++) {
						if (newVal.length > 1)
							result += i + '. ';
						result += newVal[i].message + '<br/>';
					}
					$element.attr('title', result);
					$element.tooltip('hide')
						.attr('data-original-title', newVal)
						.tooltip('fixTitle');
				});
			}
		};
	};

	/**
	 * Autocomplete directive. Bootstrap "typeahead" component is required. Applyed for <input> element.
	 */
	function izendaBootstrapAutocomplete() {
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				ngModel: '=',
				autocompleteItems: '='
			},
			link: function ($scope, $element, attrs, ngModelCtrl) {
				function extractor(query) {
					var result = /([^,]+)$/.exec(query);
					if (result && result[1])
						return result[1].trim();
					return '';
				}

				function prepareSource(items) {
					return angular.element.map(items, function (item) {
						return angular.isObject(item) ? item.text : null;
					});
				};

				function initTypeaheadComponent() {
					var items = prepareSource($scope.autocompleteItems);
					$element.typeahead('destroy');
					$element.typeahead({
						source: items,
						items: 15,
						updater: function (item) {
							return this.$element.val().replace(/[^,]*$/, '') + item;
						},
						matcher: function (item) {
							var tquery = extractor(this.query);
							if (!tquery) return false;
							return ~item.toLowerCase().indexOf(tquery.toLowerCase());
						},
						highlighter: function (item) {
							var query = extractor(this.query).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
							return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
								return '<strong>' + match + '</strong>';
							});
						}
					});
					$element.on('change', function () {
						if (angular.isString(attrs.ngChange))
							ngModelCtrl.$viewChangeListeners.push(function () {
								$scope.$eval(attrs.ngChange);
							});
					});
				};

				// prepare element
				if (!$element.hasClass('typeahead'))
					$element.addClass('typeahead');

				// watchers
				$scope.$watchCollection('autocompleteItems', function(newItems) {
					initTypeaheadComponent();
				});

				initTypeaheadComponent();
			}
		};
	};

	// definition
	angular.module('izendaCommonControls')
		.directive('izendaBootstrapTooltip', [izendaBootstrapTooltip])
		.directive('izendaBootstrapCollapse', ['$timeout', izendaBootstrapCollapse])
		.directive('izendaBootstrapAutocomplete', [izendaBootstrapAutocomplete]);
})();

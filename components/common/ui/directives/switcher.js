izendaRequire.define([
	'angular',
	'../module-definition'
], function (angular) {
	'use strict';

	/**
	 * Switcher directive
	 */
	angular.module('izenda.common.ui').directive('izendaSwitcher', [izendaSwitcher]);

	// implementation
	function izendaSwitcher() {
		return {
			restrict: 'A',
			scope: {
				tooltip: '=',
				label: '=',
				ngModel: '='
			},
			template: '<span ng-show="label != null && label != \'\'" class="izenda-common-switcher-label">{{label}}</span>' +
			'<span class="izenda-common-switcher" title="{{tooltip}}">' +
				'<span class="izenda-common-switcher-text-off">O</span>' +
				'<span class="izenda-common-switcher-item"></span>' +
				'<span class="izenda-common-switcher-text-on">I</span>' +
			'</span>',
			link: function ($scope, elem, attrs) {
				elem.click(function (e) {
					e.stopPropagation();
					$scope.ngModel = !$scope.ngModel;
					$scope.$parent.$apply();
				});
				var $switcher = elem.find('.izenda-common-switcher');
				$scope.$watch('ngModel', function (newVal) {
					if (newVal) {
						$switcher.addClass('on');
					} else {
						$switcher.removeClass('on');
					}
				});
			}
		};
	};
});
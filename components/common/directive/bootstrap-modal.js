/**
 * Bootstrap modal directive. Usage:
 * <izenda-bootstrap-modal opened="...">...</izenda-bootstrap-modal>
 */

(function () {
	'use strict';

	// template
	var izendaBootstrapModalTemplate =
  '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
  '  <div class="modal-dialog" ng-class="getModalSizeClass()">' +
  '    <div class="modal-content">' +
  '      <div ng-transclude></div>' +
  '    </div>' +
  '  </div>' +
  '</div>';

	// implementation
	function izendaBootstrapModal($timeout, $log) {
		return {
			restrict: 'A',
			transclude: true,
			scope: {
				opened: '=',
				modalSize: '@',
				isModernBootstrapVersion: '@'
			},
			template: izendaBootstrapModalTemplate,
			link: function (scope, element, attrs) {
				if (!scope.isModernBootstrapVersion) {
					element.children('.modal').css({
						'overflow-x': 'hidden',
						'overflow-y': 'scroll'
					});
				}
				element.children('.modal').on('show.bs.modal', function (e) {
					element.children('.modal').css('background-color', 'rgba(0,0,0,0.8)');
					element.children('.modal').css('filter', 'alpha(opacity=80)');
					if (!scope.isModernBootstrapVersion) {
						angular.element('body').css('margin-right', '0');
						angular.element('body').css('overflow', 'hidden');
					}
				});
				if (!scope.isModernBootstrapVersion) {
					element.children('.modal').on('shown.bs.modal', function (e) {
						angular.element('body').css('overflow', 'hidden');
						angular.element('body').scrollTop();
					});
					element.children('.modal').on('hidden.bs.modal', function (e) {
						angular.element('body').css('overflow', 'inherit');
						angular.element('body').css('margin-right', '0');
						scope.opened = false;
					});
				}

				scope.getModalSizeClass = function () {
					return scope.modalSize === 'large' ? 'modal-lg' : '';
				};

				scope.$parent.$watch(attrs.opened, function (newVal, oldVal) {
					if (newVal) {
						element.children('.modal').modal();
					} else {
						element.children('.modal').modal('hide');
					}
				});
			}
		};
	};

	// definition
	angular
    .module('izendaCommonControls')
    .directive('izendaBootstrapModal', [
      '$timeout', '$log',
      izendaBootstrapModal
    ]);
})();

izendaRequire.define([
	'angular',
	'../module-definition'
], function (angular) {

	/**
	 * Bootstrap modal directive. Usage:
	 * <izenda-bootstrap-modal opened="...">...</izenda-bootstrap-modal>
	 */
	// definition
	angular.module('izenda.common.core').directive('izendaBootstrapModal', [
		'$timeout',
		function ($timeout) {
			return {
				restrict: 'E',
				transclude: true,
				scope: {
					opened: '=',
					keyboard: '=',
					backdrop: '=',
					modalSize: '@',
					isModernBootstrapVersion: '@',
					onModalOpened: '&',
					onModalClosed: '&'
				},
				template:
					'<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
					'	<div class="modal-dialog" ng-class="getModalSizeClass()">' +
					'		<div class="modal-content">' +
					'			<div ng-transclude></div>' +
					'		</div>' +
					'	</div>' +
					'</div>',
				link: function ($scope, $element, attrs) {
					var $modal = $element.children('.modal');
					if (!$scope.isModernBootstrapVersion) {
						$modal.css({
							'overflow-x': 'hidden',
							'overflow-y': 'scroll'
						});
					}
					if ($scope.keyboard != null)
						$modal.attr('data-keyboard', $scope.keyboard);
					if ($scope.backdrop != null)
						$modal.attr('data-backdrop', $scope.backdrop);

					// modal show handler
					$modal.on('show.bs.modal', function (e) {
						$modal.css('filter', 'alpha(opacity=80)');
						if (!$scope.isModernBootstrapVersion) {
							angular.element('body').css('margin-right', '0');
							angular.element('body').css('overflow', 'hidden');
						}
					});
					// modal shown handler
					$modal.on('shown.bs.modal', function (e) {
						if (!$scope.isModernBootstrapVersion) {
							angular.element('body').css('overflow', 'hidden');
							angular.element('body').scrollTop();
						}
						if (angular.isFunction($scope.onModalOpened)) {
							$scope.onModalOpened({});
						}
					});
					// modal hidden handler
					$modal.on('hidden.bs.modal', function (e) {
						if (!$scope.isModernBootstrapVersion) {
							angular.element('body').css('overflow', 'inherit');
							angular.element('body').css('margin-right', '0');
						}
						$scope.opened = false;
						if (angular.isFunction($scope.onModalClosed))
							$scope.onModalClosed({});
						$scope.$applyAsync();
					});

					$scope.getModalSizeClass = function () {
						return $scope.modalSize === 'large' ? 'modal-lg' : '';
					};

					$scope.$watch('opened', function (newVal) {
						$modal.modal(newVal ? 'show' : 'hide');
					});
				}
			};
		}
	]);

});

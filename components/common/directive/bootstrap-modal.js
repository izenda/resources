izendaRequire.define(['angular', '../services/services'], function (angular) {

	/**
	 * Bootstrap modal directive. Usage:
	 * <izenda-bootstrap-modal opened="...">...</izenda-bootstrap-modal>
	 */
	// definition
	angular.module('izenda.common.ui').directive('izendaBootstrapModal', ['$timeout', '$log', function ($timeout, $log) {
		return {
			restrict: 'A',
			transclude: true,
			scope: {
				opened: '=',
				keyboard: '=',
				backdrop: '=',
				modalSize: '@',
				isModernBootstrapVersion: '@',
				onModalOpened: '&'
			},
			template:
				'<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
				'  <div class="modal-dialog" ng-class="getModalSizeClass()">' +
				'    <div class="modal-content">' +
				'      <div ng-transclude></div>' +
				'    </div>' +
				'  </div>' +
				'</div>',
			link: function ($scope, $element, attrs) {
				var $modal = $element.children('.modal');
				if (!$scope.isModernBootstrapVersion) {
					$modal.css({
						'overflow-x': 'hidden',
						'overflow-y': 'scroll'
					});
				}

				// modal show handler
				$modal.on('show.bs.modal', function (e) {
					$modal.css('background-color', 'rgba(0,0,0,0.8)');
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
						$scope.onModalOpened();
					}
				});
				// modal hidden handler
				$modal.on('hidden.bs.modal', function (e) {
					if (!$scope.isModernBootstrapVersion) {
						angular.element('body').css('overflow', 'inherit');
						angular.element('body').css('margin-right', '0');
					}
					$scope.opened = false;
					$scope.$applyAsync();
				});

				if ($scope.keyboard != null)
					$modal.attr('data-keyboard', $scope.keyboard);
				if ($scope.backdrop != null)
					$modal.attr('data-backdrop', $scope.backdrop);

				$scope.getModalSizeClass = function () {
					return $scope.modalSize === 'large' ? 'modal-lg' : '';
				};

				$scope.$watch('opened', function (newVal) {
					if (newVal) {
						$element.children('.modal').modal();
					} else {
						$element.children('.modal').modal('hide');
					}
				});
			}
		};
	}
	]);

});

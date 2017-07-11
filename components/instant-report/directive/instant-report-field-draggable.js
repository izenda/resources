izendaRequire.define(['angular', '../../common/services/services', '../services/services'], function (angular) {

	/**
	 * Draggable/droppable jquery-ui angular wrapper directive
	 */
	(function () {
		'use strict';

		/**
		 * Item draggable directive
		 */
		angular.module('izendaInstantReport').directive('izendaInstantReportFieldDraggable', ['$rootScope',
			function ($rootScope) {
				return {
					restrict: 'A',
					link: function (scope, elem, attrs) {
						var handle = attrs.draggableHandle || false;

						angular.element(elem).draggable({
							handle: handle,
							start: function () {
								$rootScope.isDraggingNow = true;
								$rootScope.$applyAsync();
							},
							stop: function () {
								$rootScope.isDraggingNow = false;
								$rootScope.$applyAsync();
							},
							helper: function (event) {
								var $target = angular.element(this);
								var $helper = $target.clone();
								$helper.css({
									'position': 'absolute',
									'width': $target.width(),
									'height': $target.height()
								});
								$helper.attr('draggable-data-id', $target.attr('draggable-data-id'));
								return $helper;
							},
							cursorAt: { left: -10, top: -10 },
							appendTo: 'body',
							distance: 10,
							cursor: 'move',
							zIndex: 9999
						});
						scope.$parent.$watch(attrs.draggableEnabled, function (newEnabled) {
							angular.element(elem).draggable(newEnabled ? 'enable' : 'disable');
						});
					}
				};
			}
		]);

		/**
		 * Item droppable directive
		 */
		angular.module('izendaInstantReport').directive('izendaInstantReportFieldDroppable', [
			function () {
				return {
					restrict: 'A',
					scope: {
						droppableAccept: '@',
						onDrop: '&'
					},
					link: function (scope, elem, attrs) {
						angular.element(elem).droppable({
							accept: scope.droppableAccept,
							activeClass: 'draggable-highlight',
							hoverClass: 'draggable-highlight-hover',
							tolerance: 'pointer',
							drop: function (event, ui) {
								if (angular.isFunction(scope.onDrop)) {
									scope.onDrop({
										arg0: angular.element(ui.helper).attr('draggable-data-id')
									});
								}
							}
						});
					}
				};
			}
		]);


	})();

});
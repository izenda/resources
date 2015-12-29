/**
 * Draggable jquery-ui directive
 */
(function () {
	'use strict';

	/**
	 * Draggable
	 */
	function izendaInstantReportFieldDraggable() {
		return {
			restrict: 'A',
			link: function (scope, elem, attrs) {
				angular.element(elem).draggable({
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
					appendTo: 'body',
					cursor: 'move',
					zIndex: 9999
				});
				scope.$parent.$watch(attrs.draggableEnabled, function (newEnabled) {
					angular.element(elem).draggable(newEnabled ? 'enable' : 'disable');
				});
			}
		};
	}

	/**
	 * Droppable
	 */
	function izendaInstantReportFieldDroppable() {
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

	// definition
	angular
    .module('izendaInstantReport')
    .directive('izendaInstantReportFieldDraggable', [izendaInstantReportFieldDraggable])
		.directive('izendaInstantReportFieldDroppable', [izendaInstantReportFieldDroppable]);
})();
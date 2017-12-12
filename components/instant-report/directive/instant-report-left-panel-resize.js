izendaRequire.define([
	'angular',
	'../../common/core/services/compatibility-service',
	'../services/services'
], function (angular) {

	/**
	 * Resize left panel directive
	 */
	angular.module('izendaInstantReport').directive('izendaInstantReportLeftPanelResize', ['$window', '$izendaCompatibility',
		function ($window, $izendaCompatibility) {
			return {
				restrict: 'A',
				scope: {
					leftPanelSelector: '@',
					mainPanelSelector: '@',
					opened: '='
				},
				link: function ($scope, elem) {
					$scope.$izendaCompatibility = $izendaCompatibility;
					var $elem = angular.element(elem),
							$left = angular.element($scope.leftPanelSelector),
							$main = angular.element($scope.mainPanelSelector);
					var leftInitialized = false, mainInitialized = false;

					// calculate width
					function getLeftWidth() {
						var width = $left.width();
						var styleData = $left.attr('data-style');
						var styleString = styleData ? styleData : $left.attr('style');
						if (angular.isString(styleString))
							angular.element.each(styleString.split(';'), function () {
								if (this.trim().indexOf('width') === 0) {
									var widthArray = this.split(':');
									var widthString = widthArray[1].trim();
									width = parseInt(widthString.substring(0, widthString.length - 2));
								}
							});
						return width;
					}

					// initialize jquery objects
					function initializeElements() {
						if (!leftInitialized) {
							$left = angular.element($scope.leftPanelSelector);
							leftInitialized = $left.length > 0;
						}
						if (!mainInitialized) {
							$main = angular.element($scope.mainPanelSelector);
							mainInitialized = $main.length > 0;
						}
					}

					// initialize draggable
					var windowWidth = angular.element($window).width();
					$elem.draggable({
						axis: 'x',
						zIndex: 2,
						containment: [350, 0, Math.min(1500, windowWidth - 500), 0],
						drag: function (event, ui) {
							initializeElements();
							var leftStyle = 'width: ' + ui.position.left + 'px',
									mainStyle = 'margin-left: ' + (ui.position.left + 4) + 'px';
							elem.attr('data-style', 'left: ' + ui.position.left + 'px');
							$left.attr('style', leftStyle);
							$left.attr('data-style', leftStyle);
							$main.attr('style', mainStyle);
							$main.attr('data-style', mainStyle);
						}
					});

					initializeElements();
					var width = getLeftWidth();
					var leftStyle = 'width: ' + width + 'px',
							mainStyle = 'margin-left: ' + (width + 4) + 'px';
					elem.attr('style', 'width: ' + width + 'px');
					elem.attr('data-style', 'left: ' + width + 'px');
					$left.attr('style', leftStyle);
					$left.attr('data-style', leftStyle);
					$main.attr('style', mainStyle);
					$main.attr('data-style', mainStyle);

					// open/close left panel handler
					$scope.$watch('opened', function (newOpened) {
						var isMobileView = $izendaCompatibility.isSmallResolution();
						var collapsedLeft = isMobileView ? 48 : 128;
						initializeElements();
						var width = getLeftWidth();

						if (newOpened) {
							var dataStyleLeft = $left.attr('data-style'),
									dataStyleMain = $main.attr('data-style'),
									dataStyleElem = elem.attr('data-style');
							if (angular.isUndefined(dataStyleLeft))
								dataStyleLeft = 'width: ' + (isMobileView ? '100%' : width + 'px');
							if (angular.isUndefined(dataStyleMain))
								dataStyleMain = 'margin-left: ' + (width + 4) + 'px;';
							if (angular.isUndefined(dataStyleElem))
								dataStyleElem = 'left: ' + width + 'px;';
							$left.attr('style', dataStyleLeft);
							$main.attr('style', dataStyleMain);
							elem.attr('style', dataStyleElem);
						} else {
							$left.attr('style', 'width: ' + collapsedLeft + 'px;');
							$main.attr('style', 'margin-left: ' + collapsedLeft + 'px;');
							elem.attr('style', 'left: -4px;');
						}
					});
				}
			};
		}
	]);

});
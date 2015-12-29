/**
 * Resize left panel directive
 */
angular.module('izendaInstantReport').directive('izendaInstantReportLeftPanelResize', [function () {
	return {
		restrict: 'A',
		scope: {
			leftPanelSelector: '@',
			mainPanelSelector: '@',
			optionsPanelSelector: '@',
			opened: '='
		},
		link: function ($scope, elem) {
			var $left = angular.element($scope.leftPanelSelector),
				$main = angular.element($scope.mainPanelSelector),
				$options = angular.element($scope.optionsPanelSelector);
			var leftInitialized = false, mainInitialized = false, optionsInitialized = false;
			var initializeElements = function() {
				if (!leftInitialized) {
					$left = angular.element($scope.leftPanelSelector);
					leftInitialized = $left.length > 0;
				}
				if (!mainInitialized) {
					$main = angular.element($scope.mainPanelSelector);
					mainInitialized = $main.length > 0;
				}
				if (!optionsInitialized) {
					$options = angular.element($scope.optionsPanelSelector);
					optionsInitialized = $options.length > 0;
				}
			}

			angular.element(elem).draggable({
				axis: 'x',
				zIndex: 2,
				containment: [350, 0, 1500, 0],
				drag: function (event, ui) {
					initializeElements();
					var leftStyle = 'width: ' + ui.position.left + 'px !important;',
							mainStyle = 'margin-left: ' + (ui.position.left + 4) + 'px !important;',
							optionsStyle = 'left:' + (ui.position.left + 4) + 'px !important;';
					elem.attr('data-style', 'left: ' + ui.position.left + 'px;');
					$left.attr('style', leftStyle);
					$left.attr('data-style', leftStyle);
					$main.attr('style', mainStyle);
					$main.attr('data-style', mainStyle);
					$options.attr('style', optionsStyle);
					$options.attr('data-style', optionsStyle);
				}
			});

			$scope.$watch('opened', function (newOpened) {
				initializeElements();
				if (newOpened) {
					var dataStyleLeft = $left.attr('data-style'),
							dataStyleMain = $main.attr('data-style'),
							dataStyleElem = elem.attr('data-style'),
							dataStyleOptions = $options.attr('data-style');
					if (angular.isUndefined(dataStyleLeft))
						dataStyleLeft = 'width: 550px';
					if (angular.isUndefined(dataStyleMain))
						dataStyleMain = 'margin-left: 554px;';
					if (angular.isUndefined(dataStyleOptions))
						dataStyleOptions = 'left: 554px';
					if (angular.isUndefined(dataStyleElem))
						dataStyleElem = 'left: 550px;';
					$left.attr('style', dataStyleLeft);
					$main.attr('style', dataStyleMain);
					elem.attr('style', dataStyleElem);
					$options.attr('style', dataStyleOptions);
				} else {
					$left.attr('style', 'width: 128px;');
					$main.attr('style', 'margin-left: 128px;');
					elem.attr('style', 'left: -4px;');
					$options.attr('style', 'left: 128px');
				}
			});
		}
	};
}
]);
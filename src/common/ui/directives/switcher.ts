import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaSwitcherScope extends ng.IScope {
	tooltip: string;
	label: string;
	ngModel: boolean;
}

/**
 * Switcher directive
 */
class IzendaSwitcher implements ng.IDirective {
	restrict = 'A';

	scope = {
		tooltip: '=',
		label: '=',
		ngModel: '='
	};

	template =
		`<span ng-show="label != null && label != ''" class="izenda-common-switcher-label">{{label}}</span>
<span class="izenda-common-switcher" title="{{tooltip}}">
	<span class="izenda-common-switcher-text-off">O</span>
	<span class="izenda-common-switcher-item"></span>
	<span class="izenda-common-switcher-text-on">I</span>
</span>`;

	link: ($scope: IIzendaSwitcherScope, $element: ng.IAugmentedJQuery) => void;

	constructor() {
		IzendaSwitcher.prototype.link = ($scope: IIzendaSwitcherScope, $element: ng.IAugmentedJQuery) => {

			$element.click(e => {
				e.stopPropagation();
				$scope.ngModel = !$scope.ngModel;
				$scope.$parent.$apply();
			});
			var $switcher = $element.find('.izenda-common-switcher');
			$scope.$watch('ngModel', (newVal: boolean) => {
				if (newVal)
					$switcher.addClass('on');
				else
					$switcher.removeClass('on');
			});

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		return () => new IzendaSwitcher();
	}
}
izendaUiModule.directive('izendaSwitcher', [IzendaSwitcher.factory()]);

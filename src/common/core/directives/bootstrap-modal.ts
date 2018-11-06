import * as angular from 'angular';
import 'izenda-external-libs';
import izendaCoreModule from 'common/core/module-definition';

/**
 * Bootstrap modal directive. Usage:
 * <izenda-bootstrap-modal opened="...">...</izenda-bootstrap-modal>
 */
class IzendaBootstrapModalDirective implements ng.IDirective {

	restrict = 'E';
	transclude = true;
	scope = {
		opened: '=',
		keyboard: '=',
		backdrop: '=',
		modalSize: '@',
		isModernBootstrapVersion: '@',
		onModalOpened: '&',
		onModalClosed: '&'
	};

	template = `
<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
	<div class="modal-dialog" ng-class="getModalSizeClass()">
		<div class="modal-content">
			<div ng-transclude=""></div>
		</div>
	</div>
</div>`;

	link: ($directiveScope: IIzendaBootstrapModalScope, $element: ng.IAugmentedJQuery) => void;

	constructor(private readonly $timeout: ng.ITimeoutService) {
		IzendaBootstrapModalDirective.prototype.link = ($directiveScope: IIzendaBootstrapModalScope, $element: ng.IAugmentedJQuery) => {
			$directiveScope.getModalSizeClass = () => $directiveScope.modalSize === 'large' ? 'modal-lg' : '';

			var $modal = $element.children('.modal');

			if (!$directiveScope.isModernBootstrapVersion) {
				$modal.css({
					'overflow-x': 'hidden',
					'overflow-y': 'scroll'
				});
			}

			// additional bootstrap parameters
			if ($directiveScope.keyboard != null)
				$modal.attr('data-keyboard', $directiveScope.keyboard);
			if ($directiveScope.backdrop != null)
				$modal.attr('data-backdrop', $directiveScope.backdrop);

			// modal show handler
			$modal.on('show.bs.modal', () => {
				$modal.css('background-color', 'rgba(0,0,0,0.8)');
				$modal.css('filter', 'alpha(opacity=80)');
				if (!$directiveScope.isModernBootstrapVersion) {
					angular.element('body').css('margin-right', '0');
					angular.element('body').css('overflow', 'hidden');
				}
			});

			// modal shown handler
			$modal.on('shown.bs.modal', () => {
				if (!$directiveScope.isModernBootstrapVersion) {
					angular.element('body').css('overflow', 'hidden');
					angular.element('body').scrollTop();
				}
				if (angular.isFunction($directiveScope.onModalOpened)) {
					$directiveScope.onModalOpened({});
				}
				$directiveScope.$applyAsync();
			});

			// modal hidden handler
			$modal.on('hidden.bs.modal', () => {
				if (!$directiveScope.isModernBootstrapVersion) {
					angular.element('body').css('overflow', 'inherit');
					angular.element('body').css('margin-right', '0');
				}
				$directiveScope.opened = false;
				if (angular.isFunction($directiveScope.onModalClosed)) {
					$directiveScope.onModalClosed({});
				}
				$directiveScope.$applyAsync();
			});

			$directiveScope.$watch('opened', newVal => {
				// create/hide modal dialog
				if (newVal)
					$element.children('.modal')['modal']();
				else
					$element.children('.modal')['modal']('hide');
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService) => new IzendaBootstrapModalDirective($timeout);
		directive.$inject = ['$timeout'];
		return directive;
	}
}

interface IIzendaBootstrapModalScope extends ng.IScope {
	opened: boolean;
	keyboard: string;
	backdrop: string;
	modalSize: string;
	isModernBootstrapVersion: boolean;
	onModalOpened: (any) => any;
	onModalClosed: (any) => any;
	getModalSizeClass: () => string;
}

izendaCoreModule.directive('izendaBootstrapModal', ['$timeout', IzendaBootstrapModalDirective.factory()]);

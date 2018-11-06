import * as angular from 'angular';
import IzendaUrlService from 'common/query/services/url-service';
import IzendaUtilService from 'common/core/services/util-service';

import izendaDashboardModule from 'dashboard/module-definition';

interface IIzendaToolbarFolderMenuAccordionScope extends ng.IScope {
	categories: any;
	getCategoryClass: any;
	getCategoryItemClass: any;
	extractReportName: any;
	goToDashboard: any;
	toggleAccordion: any;
}

/**
 * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
 */
class IzendaToolbarFolderMenuAccordion implements ng.IDirective {
	restrict = 'A';
	scope = {
		categories: '='
	};
	templateUrl = '###RS###extres=components.dashboard.directives.toolbar-folder-menu-accordion.html';

	link: ($scope: IIzendaToolbarFolderMenuAccordionScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor(private readonly $timeout: ng.ITimeoutService,
		private readonly $izendaUrl: IzendaUrlService,
		private readonly $izendaUtil: IzendaUtilService) {
		IzendaToolbarFolderMenuAccordion.prototype.link = ($scope: IIzendaToolbarFolderMenuAccordionScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {

			// add category 'in' class for currentCategory
			$scope.getCategoryClass = (index: number): string =>
				$izendaUtil.isCategoriesEqual($scope.categories[index].name, $izendaUrl.getReportInfo().category) ? 'in' : '';

			// get category item activated or not class
			$scope.getCategoryItemClass = (itemName: string): string =>
				itemName === $izendaUrl.getReportInfo().fullName ? 'active' : '';

			// remove category part from report name
			$scope.extractReportName = (fullName: string): string => $izendaUrl.extractReportName(fullName);

			// navigate to dashboard
			$scope.goToDashboard = (dashboard: string): void => $izendaUrl.setReportFullName(dashboard);

			// toggle accordion handler
			$scope.toggleAccordion = (index: number) => {
				const $categoryContainer = angular.element($element.children()[index]);
				const $category = $categoryContainer.find('.category');
				if ($category.hasClass('in'))
					$category.removeClass('in');
				else
					$category.addClass('in');
				if ($category.hasClass('in'))
					$categoryContainer.closest('.iz-dash-dashboards-dropdown-container').animate({
						scrollTop: $categoryContainer.position().top - $categoryContainer.parent().position().top
					}, 500);
			};

			// destruction method
			$element.on('$destroy', () => { });
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = ($timeout: ng.ITimeoutService,
			$izendaUrl: IzendaUrlService,
			$izendaUtil: IzendaUtilService) =>
			new IzendaToolbarFolderMenuAccordion($timeout, $izendaUrl, $izendaUtil);
		directive.$inject = ['$timeout', '$izendaUrl', '$izendaUtil'];
		return directive;
	}
}

izendaDashboardModule.directive('izendaToolbarFolderMenuAccordion', ['$timeout', '$izendaUrl', '$izendaUtil',
	IzendaToolbarFolderMenuAccordion.factory()]);


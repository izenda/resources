import * as angular from 'angular';
import 'izenda-external-libs';
import izendaUiModule from 'common/ui/module-definition';

interface IIzendaAutocompleteScope extends ng.IScope {
	ngModel: string;
	autocompleteItems: any;
	updateAutocompleteItems: any;
}

/**
 * Autocomplete directive. Uses "tagit". Applyed for <input izenda-autocomplete> element.
 */
class IzendaAutocomplete implements ng.IDirective {
	restrict = 'A';
	require = 'ngModel';
	scope = {
		ngModel: '=',
		autocompleteItems: '=',
		updateAutocompleteItems: '&'
	};

	link: ($scope: IIzendaAutocompleteScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;

	constructor() {
		IzendaAutocomplete.prototype.link = ($scope: IIzendaAutocompleteScope, $element: ng.IAugmentedJQuery) => {

			/**
			 * Create array with autocomplete item texts
			 * @param {Array<object>} items.
			 * @returns {Array<string>}.
			 */
			let prepareSource = (items: any[]): string[] => {
				if (!angular.isArray(items) || !items.length)
					return [];
				return items
					.filter(item => angular.isObject(item))
					.map(item => item['text']);
			};

			// initialize component
			$element.val($scope.ngModel);
			$element['tagit']({
				tagSource: (req, responseFunction) => {
					if (!angular.isFunction($scope.updateAutocompleteItems))
						return;
					var possibleText = req.term.split(/,\s*/).pop();
					// update suggested items:
					$scope.updateAutocompleteItems({ arg0: possibleText }).then(newExistentValuesList => {
						var items = prepareSource(newExistentValuesList as any[]);
						const result = items
							.filter(item => !!item && item != '...')
							.map(item => item.replaceAll('#||#', ','));
						responseFunction(result);
					});
				},
				caseSensitive: true,
				allowDuplicates: false,
				singleFieldDelimiter: jsResources.literalComma,
				processValuesForSingleField: tags => tags.map(tag => tag.replaceAll(',', '#||#')),
				processValuesFromSingleField: tags => tags.map(tag => tag.replaceAll('#||#', ','))
			});

			// add watchers
			$scope.$watch('ngModel', (newValue) => {
				if (!newValue)
					$element['tagit']('removeAll');
			});

			// destruction method
			$element.on('$destroy', () => {
				$element['tagit']('removeAll');
			});
		};
	}

	static factory(): ng.IDirectiveFactory {
		const directive = () => new IzendaAutocomplete();
		directive.$inject = [];
		return directive;
	}
}

izendaUiModule.directive('izendaAutocomplete', [IzendaAutocomplete.factory()]);

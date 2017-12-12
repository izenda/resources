izendaRequire.define([
	'angular',
	'../module-definition'
], function (angular) {

	/**
	 * Autocomplete directive. Uses "tagit". Applyed for <input> element.
	 */
	angular.module('izenda.common.ui').directive('izendaAutocomplete', [
		function () {
			return {
				restrict: 'A',
				require: 'ngModel',
				scope: {
					ngModel: '=',
					autocompleteItems: '=',
					updateAutocompleteItems: '&'
				},
				link: function ($scope, $element) {
					$element.val($scope.ngModel);
					/**
						* Create array with autocomplete item texts
						* @param {Array<object>} items.
						* @returns {Array<string>}.
						*/
					function prepareSource(items) {
						if (!angular.isArray(items))
							return [];
						return angular.element.map(items, function (item) {
							return angular.isObject(item) ? item.text : null;
						});
					};

					/**
						* Initialize tagit component.
						*/
					function initTagIt() {
						$element.tagit({
							tagSource: function (req, responseFunction) {
								if (angular.isFunction($scope.updateAutocompleteItems)) {
									var possibleText = req.term.split(/,\s*/).pop();
									// update suggested items:
									$scope.updateAutocompleteItems({ arg0: possibleText }).then(function (newExistentValuesList) {
										var result = [];
										var items = prepareSource(newExistentValuesList);
										if (angular.isArray(items)) {
											angular.element.each(items, function (iItem, item) {
												if (!angular.isString(item) || item === '' || item === '...')
													return;
												result.push(this.replaceAll('#||#', ','));
											});
										}
										responseFunction(result);
									});
								}
							},
							caseSensitive: true,
							allowDuplicates: false,
							singleFieldDelimiter: jsResources.literalComma,
							processValuesForSingleField: function (tags) {
								for (var i = 0; i < tags.length; i++)
									tags[i] = tags[i].replaceAll(',', '#||#');
								return tags;
							},
							processValuesFromSingleField: function (tags) {
								for (var i = 0; i < tags.length; i++)
									tags[i] = tags[i].replaceAll('#||#', ',');
								return tags;
							}
						});
					}

					// watchers
					$scope.$watch('ngModel', function (newValue, oldValue) {
						if (!newValue) {
							$element.tagit('removeAll');
						}
					});

					initTagIt();
				}
			}
		}
	]);

});

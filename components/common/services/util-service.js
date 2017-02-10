define(['../module-definition'], function () {

	/**
	 * Utility functions.
	 */
	angular.module('izenda.common.compatibility').factory('$izendaUtil', [
		function () {

			/**
			 * Create human readable variable name version
			 */
			var humanizeVariableName = function (text) {
				if (!angular.isString(text))
					return text;
				var result = text
					// insert a space between lower & upper
					.replace(/([a-z])([A-Z\d])/g, '$1 $2')
					// space before last upper in a sequence followed by lower
					.replace(/\b([A-Z\d]+)([A-Z\d])([a-z])/, '$1 $2$3')
					// uppercase the first character
					.replace(/^./, function (text) {
						return text.toUpperCase();
					});
				return result;
			};

			/**
			 * Convert options which have got from server using "GetOptionsByPath" query into 
			 * one dimentional array, which allow to use it as <option>
			 */
			var convertOptionsByPath = function (options) {
				var groups = [];
				angular.element.each(options, function () {
					var group = this;
					angular.element.each(group.options, function () {
						var option = this;
						option.group = angular.isString(group.name) && group.name !== ''
							? group.name
							: undefined;
						groups.push(option);
					});
				});
				return groups;
			};

			/**
			 * Get option by value from array of objects with "value" property (case insensitive): 
			 * [{value:'text1',...}, {value:'text2', ...}, ...]
			 */
			var getOptionByValue = function (options, value) {
				var i = 0;
				while (i < options.length) {
					var option = options[i];
					if (option.value.toLowerCase() === value.toLowerCase())
						return option;
					i++;
				}
				return null;
			};

			return {
				humanizeVariableName: humanizeVariableName,
				convertOptionsByPath: convertOptionsByPath,
				getOptionByValue: getOptionByValue
			}
		}]);

});
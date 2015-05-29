angular
  .module('izendaFilters')
  .controller('IzendaFiltersController', [
    '$scope',
    '$rootScope',
    '$log',
    '$sce',
    '$izendaUrl',
    '$izendaFiltersQuery',
    IzendaFiltersController]);

/**
  * Controller for filters
  */
// ReSharper disable once InconsistentNaming
function IzendaFiltersController(
  $scope,
  $rootScope,
  $log,
  $sce,
  $izendaUrl,
  $izendaFiltersQuery) {
  'use strict';

  var _ = angular.element;
  var vm = this;

  var ALL_FILTERS_NAME = 'All';
  vm.isCascadingEnabled = false;
  vm.izendaUrl = $izendaUrl;
  vm.opened = false;
  vm.isFiltersVisible = false;
  vm.isCommonFiltersSet = false;
  vm.selectedFilter = null;
  vm.tileTitles = {};
  vm.containerStyle = {
    /*height: 0,*/
    display: 'none',
    opacity: 0
  };
  vm.filtersData = [];
  vm.reportPartFilters = [];

  ////////////////////////////////////////////////////////
  // popup filter
  ////////////////////////////////////////////////////////

  /**
   * Open popup filter
   */
  vm.openPopupFilter = function (filter) {
    if (filter.disabled)
      return;
    vm.selectedFilter = filter;
    _('#izendaFilterCheckboxesModal').modal();
  };

  /**
   * Create popup label text
   */
  vm.getPopupLabelText = function(filter, crop) {
    if (filter.Values == null || filter.Values.length == 0)
      return '...';
    if (filter.Values.length == 1 && filter.Values[0] == '...')
      return '...';
    var str = filter.Values.join(', ');
    if (str.length < 30 || !crop)
      return str;
    return str.substr(0, 30) + '...';
  };

  /**
   * Update popup filter value
   */
  vm.clickPopupCheckbox = function (value) {
    if (value == '...') {
      vm.selectedFilter.Values = ['...'];
    } else {
      var emptyIndex = vm.selectedFilter.Values.indexOf('...');
      if (emptyIndex >= 0) {
        vm.selectedFilter.Values.splice(emptyIndex, 1);
      }
      if (vm.selectedFilter.Values.indexOf(value) >= 0)
        vm.selectedFilter.Values.splice(vm.selectedFilter.Values.indexOf(value), 1);
      else
        vm.selectedFilter.Values.push(value);
    }
    
    vm.notifyFilterUpdated(vm.selectedFilter);
  };

  /**
   * Is popup checked
   */
  vm.isPopupChecked = function (value) {
    return angular.isDefined(vm.selectedFilter) && vm.selectedFilter.Values.indexOf(value) >= 0;
  };

  //////////////// end popup filter ////////////////

  /**
   * Find filter group by given name
   */
  vm.getFilterObjByName = function(name, filterObjCollection) {
    var result = _.grep(filterObjCollection, function(fObj) {
      return fObj.Name === name;
    });
    return result.length > 0 ? result[0] : null;
  };

  /**
   * Get filter index in collection
   */
  vm.getFilterIndex = function (uid, collection) {
    var searchCollection = angular.isUndefined(collection) ? vm.filtersData : collection;
    for (var i = 0; i < searchCollection.length; i++) {
      var f = searchCollection[i];
      if (f.Uid === uid)
        return i;
    }
    return null;
  };

  /**
   * Find filter in collection by given filter Uid
   */
  vm.getFilterByUid = function(uid, collection) {
    var searchCollection = angular.isUndefined(collection) ? vm.filtersData : collection;
    for (var i = 0; i < searchCollection.length; i++) {
      var f = searchCollection[i];
      if (f.Uid === uid)
        return f;
    }
    return null;
  };

  /**
   * Copy values from source to dest
   */
  vm.syncFilterValues = function (dest, source) {
    dest.Value = source.Value;
    dest.Values = _.extend(true, [], source.Values);
    dest.ExistingLabels = _.extend(true, [], source.ExistingLabels);
    dest.ExistingValues = _.extend(true, [], source.ExistingValues);
    dest.ExistingLabelsAndValues = _.extend(true, [], source.ExistingLabelsAndValues);
  };
  
  /**
   * Remove selected filter value
   */
  vm.resetFilterValues = function (filter) {
    filter.Value = '';
    filter.Values = ['', ''];
    switch(filter.ControlType) {
      case 1:
      case 3:
      case 4:
      case 7:
      case 9:
        filter.Value = '...';
        break;
      case 6:
      case 10:
        filter.Values = ['...'];
        break;
      case 8:
        filter.Values = [];
        break;
    }
  };

  /**
   * Get filters after current
   */
  vm.getNextFiltersInGroup = function (filterObj, filter) {
    var result = [];
    var found = false;
    for (var i = 0; i < filterObj.Value.Filters.length; i++) {
      var currentFilter = filterObj.Value.Filters[i];
      if (found) {
        result.push(currentFilter);
      }
      if (currentFilter.Uid === filter.Uid)
        found = true;
    }
    return result;
  };

  /**
   * Reset filter values in group after selected filter
   */
  vm.resetNextFiltersInGroup = function (filterObj, filter) {
    var nextFilters = vm.getNextFiltersInGroup(filterObj, filter);
    _.each(nextFilters, function (iF, f) {
      vm.resetFilterValues(f);
    });
  };

  /**
   * Set next filter isLoading parameter
   */
  vm.setNextFiltersInGroupLoading = function(filterObj, filter, value) {
    var nextFilters = vm.getNextFiltersInGroup(filterObj, filter);
    _.each(nextFilters, function (iF, f) {
      f.isLoading = value;
    });
  };

  /**
   * Check filter has value
   */
  vm.isFilterSet = function(filter) {
    switch (filter.ControlType) {
      case 1:
      case 3:
      case 4:
      case 7:
      case 9:
        return filter.Value != '...' && filter.Value != '';
      case 2:
      case 5:
        return filter.Values[0] !== '' && filter.Values[1] !== '';
      case 6:
      case 8:
      case 10:
        return filter.Values != null && filter.Values.length > 0 && !(filter.Values.length == 1 && filter.Values[0] == '...');
    }
    return true;
  };

  /**
   * Get filter is set style
   */
  vm.getFilterSetStyle = function (filter) {
    return vm.isFilterSet(filter) ? {
      'background-color': 'rgb(24, 173, 67)'
    } : null;
  };

  vm.fixFilterObjTitle = function(filterObj) {
    var filterObjName = filterObj.Name;
    if (filterObjName in vm.tileTitles) {
      var title = vm.tileTitles[filterObjName];
      if (angular.isString(title) && title != '')
        filterObj.Title = vm.tileTitles[filterObjName];
    }
  };

  /**
   * Fix filters for showing it in UI data after receive
   */
  vm.fixFiltersData = function (reportPartFilters) {
    _.each(reportPartFilters, function (iFilterObj, filterObj) {
      _.each(filterObj.Value.Filters, function(iFilter, filter) {
        switch (filter.ControlType) {
          case 3:
          case 4:
            if (filter.Value == null || filter.Value == '')
              filter.Value = '...';
            break;
          case 8:
            if (filter.Values == null || (filter.Values.length == 2 && filter.Values[0] == '' && filter.Values[1] == '')) {
              filter.Values = [];
            }
            if (filter.Value != null && filter.Value != '') {
              filter.Values = filter.Value.split(',');
            }
            break;
          case 10:
          case 6:
            if (filter.Values == null || (filter.Values.length == 2 && filter.Values[0] == '' && filter.Values[1] == '')) {
              filter.Values = ['...'];
            }
            if (filter.Value != null && filter.Value != '') {
              filter.Values = filter.Value.split(',');
            }
            break;
        }
        // trust values
        var decodeHtml = function (html) {
          var txt = document.createElement("textarea");
          txt.innerHTML = html;
          return txt.value;
        };
        filter.ExistingLabelsAndValues = [];
        for (var j = 0; j < filter.ExistingLabels.length; j++) {
          var val = decodeHtml(filter.ExistingLabels[j]);
          filter.ExistingLabels[j] = val;
          filter.ExistingLabelsAndValues[j] = {
            label: val,
            value: filter.ExistingValues[j]
          };
        }
      });

      vm.fixFilterObjTitle(filterObj);
    });
  };
  
  /**
   * Runs before sending filters to server
   */
  vm.prepareFiltersDataToSend = function () {
    var result = _.extend(true, [], vm.reportPartFilters);
    _.each(result, function(iFilterObj, filterObj) {
      _.each(filterObj.Value.Filters, function(iFilter, filter) {
        switch (filter.ControlType) {
          case 1:
          case 11:
          case 100:
          case 3:
          case 4:
          case 7:
          case 9:
            filter.Values = [filter.Value];
            break;
          case 6:
          case 8:
          case 10:
            var fa2 = filter.Values.join(',');
            filter.Values = [fa2];
            break;
        }
        delete filter.ExistingValues;
        delete filter.ExistingLabels;
        delete filter.ExistingLabelsAndValues;
        delete filter.AgainstHiddenField;
        delete filter.AliasTable;
        delete filter.ColumnName;
        delete filter.ControlType;
        delete filter.Description;
        delete filter.DupFilter;
        delete filter.FieldFilter;
        delete filter.GUID;
        delete filter.OperatorFriendlyName;
        delete filter.OperatorValue;
        delete filter.Parameter;
        delete filter.Removed;
        delete filter.Type;
        delete filter.disabled;
        delete filter.IsCommon;
        delete filter.showDisableButton;
      });
    });
    return result;
  };

  /**
   * Update container style object
   */
  vm.updateContainerStyle = function () {
    if (vm.opened) {
      vm.containerStyle = {
        /*height: 150 * (Math.floor((vm.filtersData.length == 0 ? 0 : vm.filtersData.length - 1) / 4) + 1) + 150,*/
        display: '',
        opacity: 1
      };
    } else {
      vm.containerStyle = {
        /*height: 0,*/
        display: 'none',
        opacity: 0
      };
    }
  };

  vm.ledTile = function (reportName, state) {
    var eventName = state ? 'tileLedStartEvent' : 'tileLedEndEvent';
    $rootScope.$broadcast(eventName, [reportName]);
  };

  /**
   * Activate(show) filters group
   */
  vm.activateFiltersGroup = function (filterGroup) {
    vm.filtersData = filterGroup.Value.Filters;
    vm.activeFilterGroup = filterGroup.Name;
    vm.updateContainerStyle();
  };

  /**
   * Get class for filters category
   */
  vm.getClassForFiltersCategory = function (category) {
    return category === vm.activeFilterGroup ? 'active' : '';
  };

  /**
   * Set common filter values to other filter groups
   */
  vm.applyCommonFiltersValues = function () {
    if (!vm.isCommonFiltersSet)
      return;
    $log.debug('apply common filters');

    var commonFilters = vm.reportPartFilters[0].Value.Filters;

    _.each(vm.reportPartFilters, function (iFilterObj, filterObj) {
      if (iFilterObj == 0)
        return;
      _.each(commonFilters, function (iCommonFilter, commonFilter) {
        _.each(filterObj.Value.Filters, function (iFilter, filter) {
          if (filter.Uid === commonFilter.Uid && filter.disabled) {
            vm.syncFilterValues(filter, commonFilter);
          } else if (filter.Uid === commonFilter.Uid && !filter.disabled) {
          }
        });
      });
    });
  };

  /**
   * Load and initialize dashboard filters
   */
  vm.initializeDashboardFilters = function () {
    vm.opened = false;
    vm.updateContainerStyle();
    vm.isCascadingEnabled = false;
    $scope.$evalAsync();
    $izendaFiltersQuery
      .loadAllFiltersData()
      .then(function (data) {
        vm.filtersData = [];
        vm.reportPartFilters = [];
        vm.isCommonFiltersSet = false;

        if (data.FiltersByName.length == 0) {
          return;
        }
        vm.fixFiltersData(data.FiltersByName);

        var commonFilters = _.grep(data.FiltersByName, function (filterObj) {
          return filterObj.IsCommon;
        });
        _.each(data.FiltersByName, function (iFilterObj, filterObj) {
          setFilterCollectionEnabled(filterObj.Value.Filters, true);
          if (filterObj.IsCommon) {
            filterObj.Title = filterObj.Name;
            vm.isCommonFiltersSet = true;
            vm.activeFilterGroup = filterObj.Name;
            vm.filtersData = filterObj.Value.Filters;
            _.each(vm.filtersData, function(iFilter, filter) {
              filter.IsCommon = true;
            });
          } else {
            // update report title name
            var parsedName = $izendaUrl.extractReportPartNames(filterObj.Name);
            var newName = parsedName.reportCategory != null ? parsedName.reportCategory + ' / ' : '';
            newName += parsedName.reportName + ' / ';
            newName += parsedName.reportPartName;
            filterObj.Title = newName;
            if (commonFilters.length > 0) {
              for (var j = commonFilters[0].Value.Filters.length - 1; j >= 0; j--) {
                var commonFilterForTile = _.extend({}, commonFilters[0].Value.Filters[j]);
                commonFilterForTile.disabled = true;
                commonFilterForTile.showDisableButton = true;
                filterObj.Value.Filters.unshift(commonFilterForTile);
              }
            }
          }
          // add filter obj to filters collection:
          vm.reportPartFilters.push(filterObj);
          vm.fixFilterObjTitle(filterObj);
        });
        if (!vm.isCommonFiltersSet && vm.reportPartFilters.length > 0) {
          vm.activeFilterGroup = vm.reportPartFilters[0].Name;
          vm.filtersData = vm.reportPartFilters[0].Value.Filters;
        }
        vm.updateContainerStyle();
        // start listening for filters change
        vm.isCascadingEnabled = true;
        $scope.$evalAsync();
        $rootScope.$broadcast('IzendaFiltersController.filtersLoaded', []);
      });
  };

  /**
   * Runs when filter value was changed
   */
  vm.notifyFilterUpdated = function (filter) {
    $scope.$emit('izendaFiltersUpdatedValue', [filter]);
  };

  /**
   * Cascade refresh filters
   */
  vm.refreshCascadingFilters = function (filterUpdated) {
    if (!vm.isCascadingEnabled)
      return;
    $log.debug('refresh cascading filters');
    vm.isCascadingEnabled = false;
    
    // if common filter was updated:
    if (filterUpdated.IsCommon && vm.activeFilterGroup == ALL_FILTERS_NAME) {
      _.each(vm.reportPartFilters, function(iFilterObj, filterObj) {
        var f = vm.getFilterByUid(filterUpdated.Uid, filterObj.Value.Filters);
        vm.resetNextFiltersInGroup(filterObj, f);
      });
      vm.applyCommonFiltersValues();
    } else {
      // return if it is last filter
      if (vm.getFilterIndex(filterUpdated.Uid) == vm.filtersData.length - 1) {
        vm.isCascadingEnabled = true;
        return;
      }
      var fObj = vm.getFilterObjByName(vm.activeFilterGroup, vm.reportPartFilters);
      vm.resetNextFiltersInGroup(fObj, filterUpdated);
    }

    $scope.$evalAsync();

    var preparedFiltersToSend = vm.prepareFiltersDataToSend();
    $izendaFiltersQuery
      .refreshCascadingFilters(preparedFiltersToSend)
      .then(function (data) {
        vm.fixFiltersData(data.FiltersByName);
        _.each(data.FiltersByName, function(iSourceFilterObj, sourceFilterObj) {
          var destFilterObj = vm.getFilterObjByName(sourceFilterObj.Name, vm.reportPartFilters);
          if (destFilterObj != null && destFilterObj.Value != null) {
            _.each(destFilterObj.Value.Filters, function(iDestFilter, destFilter) {
              var sourceFilter = vm.getFilterByUid(destFilter.Uid, sourceFilterObj.Value.Filters);
              if (sourceFilter != null && filterUpdated.Uid != sourceFilter.Uid)
                vm.syncFilterValues(destFilter, sourceFilter);
            });
            vm.fixFilterObjTitle(destFilterObj);
          }
        });
        
        /*if (filterUpdated.IsCommon && vm.activeFilterGroup == ALL_FILTERS_NAME)
          vm.applyCommonFiltersValues();*/
        vm.isCascadingEnabled = true;
        $scope.$evalAsync();
    });
  },

  ////////////////////////////////////////////////////////
  // Filters open/close
  ////////////////////////////////////////////////////////

  /**
   * Filters applyed
   */
  vm.applyFilters = function () {
    var preparedFilters = vm.prepareFiltersDataToSend();
    $izendaFiltersQuery
      .setFiltersData(preparedFilters)
      .then(function (data) {
        $rootScope.$broadcast('dashboardRefreshEvent', []);
      });
  };

  /**
   * Open filters panel and initialize filters
   */
  vm.openFiltersPanel = function () {
    if (vm.reportPartFilters.length == 0) 
      return;
    vm.opened = true;
    vm.containerStyle.display = '';
    $scope.$evalAsync();
    vm.updateContainerStyle();
    vm.isFiltersVisible = true;
  };

  /**
   * Close filters panel
   */
  vm.closeFiltersPanel = function () {
    vm.opened = false;
    vm.isFiltersVisible = false;
    vm.updateContainerStyle();
  };

  /**
   * Toggle filters panel
   */
  vm.toggleFiltersPanel = function () {
    if (vm.opened)
      vm.closeFiltersPanel();
    else
      vm.openFiltersPanel();
  };

  ////////////////////////////////////////////////////////
  // Initialize
  ////////////////////////////////////////////////////////

  /**
   * Initialize filters controllers
   */
  vm.initialize = function () {

    /**
     * Tile title set event handler
     */
    $scope.$on('tileTitleSet', function (event, args) {
      var filterObjName = args[0];
      var title = args[1];
      vm.tileTitles[filterObjName] = title;
      var filterObj = vm.getFilterObjByName(filterObjName, vm.reportPartFilters);
      if (filterObj != null && angular.isString(title) && title != '') {
        filterObj.Title = title;
        vm.fixFilterObjTitle(filterObj);
      }
    });

    /**
     * Refresh filters event
     */
    $scope.$on('refreshFilters', function () {
      vm.initializeDashboardFilters();
    });

    // open filters event handler
    $scope.$on('izendaFiltersOpen', function () {
      vm.openFiltersPanel();
    });

    // close filters event handler
    $scope.$on('izendaFiltersClose', function () {
      vm.closeFiltersPanel();
    });

    // toggle filters event handler
    $scope.$on('izendaFiltersToggle', function () {
      vm.toggleFiltersPanel();
    });

    // fires when filter was changed
    $scope.$on('izendaFiltersUpdatedValue', function (event, args) {
      var filter = args[0];
      // set common filter value if filter was just disabled
      if (filter.disabled && vm.isCommonFiltersSet && vm.activeFilterGroup !== ALL_FILTERS_NAME) {
        var commonFilter = vm.getFilterByUid(filter.Uid, vm.reportPartFilters[0].Value.Filters);
        if (commonFilter != null) {
          vm.syncFilterValues(filter, commonFilter);
        }
      }
      vm.refreshCascadingFilters(filter);
    });
  };

  /**
   * Turn disable/enable filters
   */
  function setFilterCollectionEnabled(filters, isEnabled) {
    _.each(filters, function (iFilter, filter) {
      filter.disabled = !isEnabled;
    });
  }
}
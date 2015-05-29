/**
 * Share report control
 */
function ShareControlContainer() {
  this.$shareControlContainer = jq$('#shareControlContainer');
}

/**
  * Get selects for subjects
  */
ShareControlContainer.prototype.getSubjectSelects = function () {
  return this.$shareControlContainer.find('.select-subject');
};

/**
  * Disable options which was selected.
  */
ShareControlContainer.prototype.disableSelectedItems = function () {
  var selectedItems = [];
  jq$.each(this.getSubjectSelects(), function () {
    var $select = jq$(this);
    var selectedValue = $select.children('option:selected').attr('value');
    if (selectedValue !== '...' && selectedItems.indexOf(selectedValue) < 0) {
      selectedItems.push(selectedValue);
    }
  });
  jq$.each(this.getSubjectSelects(), function () {
    var $select = jq$(this);
    $select.children('option').each(function () {
      var $option = jq$(this);
      if (selectedItems.indexOf($option.attr('value')) >= 0) {
        $option.attr('disabled', 'disabled');
      } else {
        $option.removeAttr('disabled');
      }
    });
  });
};

/**
  * Render row with 2 selects. Returns <div class="row">...</div>
  */
ShareControlContainer.prototype.renderSelectRow = function () {
  var $row = jq$('<div class="row subjects-row"></div>');
  var $cell1 = jq$('<div class="col-xs-6"></div>');
  var $cellSign = jq$('<div class="col-xs-1"><span class="glyphicon glyphicon-arrow-right" style="margin: 8px 0;"></span></div>');
  var $cell2 = jq$('<div class="col-xs-5"></div>');
  $row.append($cell1);
  $row.append($cellSign);
  $row.append($cell2);

  // create subjects select
  var $select = jq$('<select class="form-control select-subject"></select>');
  $select.attr('id', 'shareSubjectSelect' + Math.floor(Math.random() * 1000000000));
  jq$.each(this.securitySubjects, function (iSubject, subject) {
    var $option = jq$('<option></option>');
    $option.val(subject);
    $option.text(subject);
    $select.append($option);
  });
  $cell1.append($select);
  var _this = this;
  $select.change(function () {
    _this.disableSelectedItems();
    if (typeof (_this.defaultRight) == 'string') {
      jq$(this).closest('.subjects-row').find('.select-right').val(_this.defaultRight);
    } else {
      jq$(this).closest('.subjects-row').find('.select-right').val('...');
    }
  });

  // create rights select
  var $select2 = jq$('<select class="form-control select-right"></select>');
  jq$.each(this.rights, function (iRight, right) {
    var $option = jq$('<option></option>');
    $option.val(right);
    $option.text(right);
    $select2.append($option);
    if (typeof (_this.defaultRight) == 'string' && _this.defaultRight.toLowerCase() === right.toLowerCase()) {
      $option.attr('selected', 'selected');
    }
  });
  $cell2.append($select2);
  return $row;
};

/**
  * Render header row
  */
ShareControlContainer.prototype.renderHeaderRow = function () {
  var $row = jq$('<div class="row subjects-row hidden"></div>');
  var $cell1 = jq$('<div class="col-xs-6"></div>');
  var $cell2 = jq$('<div class="col-xs-5 col-xs-offset-1"></div>');
  $row.append($cell1);
  $row.append($cell2);
  var $label1 = jq$('<label>Share With</label>');
  var $label2 = jq$('<label>Rights</label>');
  $cell1.append($label1);
  $cell2.append($label2);
  return $row;
};

/**
  * Render add button
  */
ShareControlContainer.prototype.renderAddButton = function () {
  var $row = jq$('<div class="row add-button-row"></div>');
  var $cell1 = jq$('<div class="col-xs-12"></div>');
  var $button = jq$('<button></button>');
  $button.addClass('btn');
  $button.addClass('btn-default');
  var $glyph = jq$('<span class="glyphicon glyphicon-plus"></span>');
  $button.append($glyph);
  $button.append(jq$('<span>&nbsp;Add Rights</span>'));
  $cell1.append($button);
  $row.append($cell1);
  return $row;
};

/**
  * Load share data
  */
ShareControlContainer.prototype.loadData = function (completedHandler) {
  var requestString = 'wscmd=getCrsShare';
  var _this = this;
  AjaxRequest(urlSettings.urlRsPage, requestString, function (returnObj) {
    _this.defaultRight = returnObj.DefaultSharingRights;

    _this.rights = [];
    jq$.each(returnObj.Rights, function() {
      _this.rights.push(this.Text);
    });
    _this.rights.unshift("...");

    _this.securitySubjects = [];
    jq$.each(returnObj.ShareWith, function() {
      _this.securitySubjects.push(this.Text);
    });
    _this.securitySubjects.unshift("...");

    // add existing rights
    
    for (var subject in returnObj.ReportVisibility) {
      if (returnObj.ReportVisibility.hasOwnProperty(subject)) {
        _this.$shareControlContainer.find('.subjects-row').removeClass('hidden');
        var currentRowsCount = _this.$shareControlContainer.children('.subjects-row').length;
        if (currentRowsCount < _this.securitySubjects.length) {
          var $row = _this.renderSelectRow();
          $row.insertBefore(_this.$shareControlContainer.children('.add-button-row'));
          if (currentRowsCount === _this.securitySubjects.length - 1)
            jq$(this).remove();
          $row.find('.select-subject').val(subject);
          $row.find('.select-right').val(returnObj.ReportVisibility[subject]);
        }
      }
    }
    _this.disableSelectedItems();

    if (typeof (completedHandler) == 'function') {
      completedHandler.apply(_this);
    }
  });
};

/**
 * Create result;
 */
ShareControlContainer.prototype.createShareResultObject = function () {
  var result = {};
  jq$.each(this.getSubjectSelects(), function() {
    var $select = jq$(this);
    var selectedValue = $select.children('option:selected').attr('value');
    var $selectRights = $select.closest('.subjects-row').find('.select-right');
    var selectedRightValue = $selectRights.children('option:selected').attr('value');
    if (selectedValue !== '...' && selectedRightValue !== '...') {
      result[selectedValue] = selectedRightValue;
    }
  });
  return result;
};

/**
 * Save share settings
 */
ShareControlContainer.prototype.saveShareState = function (objectToSend) {
  var requestString = 'wscmd=setCrsShare&wsarg0=' + JSON.stringify(objectToSend);
  AjaxRequest(urlSettings.urlRsPage, requestString, function (returnObj) {
    if (returnObj != null && returnObj.Value !== 'OK') {
      alert(returnObj.Value);
    }
  });
};

/**
  * Initialize
  */
ShareControlContainer.prototype.initialize = function () {
  this.$shareControlContainer.empty();

  // render header
  var $header = this.renderHeaderRow();
  this.$shareControlContainer.append($header);

  // create add button
  var $addButtonRow = this.renderAddButton();
  this.$shareControlContainer.append($addButtonRow);

  // load data
  this.loadData(function() {
    var _this = this;
    $addButtonRow.find('button').click(function () {
      _this.$shareControlContainer.find('.subjects-row').removeClass('hidden');

      var currentRowsCount = _this.$shareControlContainer.children('.subjects-row').length;
      if (currentRowsCount < _this.securitySubjects.length) {
        var $row = _this.renderSelectRow();
        $row.insertBefore(jq$(this).parent().parent());
        if (currentRowsCount === _this.securitySubjects.length - 1)
          jq$(this).remove();
      }
    });
  });

  // save button click
  var _this = this;
  jq$('#shareSaveButton').click(function () {
    var objectToSend = _this.createShareResultObject();
    _this.saveShareState(objectToSend);
  });
};
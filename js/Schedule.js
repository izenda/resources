function IzendaScheduleControl(initializeOnCreate) {
	this.$scheduleDatetimePicker = jq$('#scheduleDatetimePicker1');
	this.$scheduleTimePicker = jq$('#scheduleTimePicker1');
	this.$scheduleTzPicker = jq$('#scheduleTzPicker1');
	this.$scheduleRepeatPicker = jq$('#scheduleRepeatPicker1');
	this.$scheduleEmailPicker = jq$('#scheduleEmailPicker1');
	this.$scheduleRecepientsPicker = jq$('#scheduleRecepientsPicker1');
	this.$scheduleAlerts = jq$('#scheduleAlerts1');
	if (initializeOnCreate)
		this.initialize();
}

/**
 * Load schedule form values.
 */
IzendaScheduleControl.prototype.loadScheduleState = function () {
	this.resetForm();
	var requestString = 'wscmd=getCrsSchedule&wsarg0=' + new Date().getTimezoneOffset();
	var datePicker = this.datePicker,
      timePicker = this.timePicker,
      $scheduleRepeatPicker = this.$scheduleRepeatPicker,
      $scheduleTzPicker = this.$scheduleTzPicker,
      $scheduleEmailPicker = this.$scheduleEmailPicker,
      $scheduleRecepientsPicker = this.$scheduleRecepientsPicker;
	AjaxRequest(urlSettings.urlRsPage, requestString, function (returnObj, id) {
		var date = returnObj.Date;
		if (date.getFullYear() > 1900) {
			datePicker.datepicker('update', date);
			timePicker.timepicker('setTime', date.toLocaleTimeString("en-US"));
		} else {
			datePicker.datepicker('update', null);
			timePicker.timepicker('setTime', null);
		}

		// recipients
		$scheduleRecepientsPicker.val(returnObj.Recipients);

		// send email type
		$scheduleEmailPicker.empty();
		jq$.each(returnObj.SendEmailList, function (iEmail, email) {
			var $option = jq$('<option></option>');
			$option.attr('value', email.Value)
        .text(email.Text);
			if (email.Selected)
				$option.attr('selected', 'selected');
			$scheduleEmailPicker.append($option);
		});

		// timezone
		$scheduleTzPicker.empty();
		jq$.each(returnObj.TimeZones, function (iTimezone, timezone) {
			var $option = jq$('<option></option>');
			$option.attr('value', timezone.Value)
        .text(jq$('<div/>').html(timezone.Text).text());
			if (timezone.Selected)
				$option.attr('selected', 'selected');
			if (!timezone.Enabled)
				$option.attr('disabled', 'true');
			$scheduleTzPicker.append($option);
		});

		// repeat type
		$scheduleRepeatPicker.empty();
		jq$.each(returnObj.RepeatTypes, function (iRepeatType, repeatType) {
			var $option = jq$('<option></option>');
			$option.attr('value', repeatType.Value)
        .text(repeatType.Text);
			if (repeatType.Selected)
				$option.attr('selected', 'selected');
			$scheduleRepeatPicker.append($option);
		});


	}, null, 'getCrsSchedule');
};

/**
 * Create schedule return object
 */
IzendaScheduleControl.prototype.createScheduleResultObject = function () {
	var objectToSend = {
		date: this.$scheduleDatetimePicker.val(),
		time: this.$scheduleTimePicker.val(),
		timezone: this.$scheduleTzPicker.val(),
		repeat: this.$scheduleRepeatPicker.val(),
		email: this.$scheduleEmailPicker.val(),
		recipients: this.$scheduleRecepientsPicker.val()
	};
	return objectToSend;
};

/**
 * Save schedule form values
 */
IzendaScheduleControl.prototype.saveScheduleState = function (objectToSend) {
	var requestString = 'wscmd=setCrsSchedule&wsarg0=' + JSON.stringify(objectToSend);
	AjaxRequest(urlSettings.urlRsPage, requestString, function (returnObj, id) {
		if (returnObj != null && returnObj.Value != 'OK') {
			alert(returnObj.Value);
		}
	});
};

/**
 * Clear form values
 */
IzendaScheduleControl.prototype.resetForm = function () {
	this.$scheduleDatetimePicker.val('');
	this.$scheduleTimePicker.val('');
	this.$scheduleTzPicker.empty();
	this.$scheduleRepeatPicker.empty();
	this.$scheduleEmailPicker.empty();
	this.$scheduleRecepientsPicker.val('');
	this.$scheduleAlerts.empty();
	this.$scheduleAlerts.addClass('hidden');
};

/**
 * Initialize 
 */
IzendaScheduleControl.prototype.initialize = function () {
	// initialize date control
	var format = 'mm/dd/yyyy';
	var date = new Date();
	this.datePicker = this.$scheduleDatetimePicker.parent().datepicker({
		format: format,
		clearBtn: true,
		autoclose: true
	});
	this.datePicker.datepicker('update', date);

	// initialize time control
	var timepicker = this.timePicker = this.$scheduleTimePicker.timepicker({
		minuteStep: 5
	});
	this.timePicker.timepicker('setTime', date.toLocaleTimeString("en-US"));
	this.timePicker.parent().children('.input-group-addon').click(function () {
		timepicker.timepicker('showWidget');
	});

	// save button
	var _this = this;
	jq$('#scheduleSaveButton').click(function () {
		var objectToSend = _this.createScheduleResultObject();
		_this.saveScheduleState(objectToSend);
	});

	// load schedule data
	this.loadScheduleState();
};


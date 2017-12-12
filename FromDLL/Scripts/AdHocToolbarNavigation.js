/* Copyright (c) 2005 Izenda, Inc.

 ____________________________________________________________________
|                                                                   |
|   Izenda .NET Component Library                                   |
|                                                                   |
|   Copyright (c) 2005 Izenda, Inc.                                 |
|   ALL RIGHTS RESERVED                                             |
|                                                                   |
|   The entire contents of this file is protected by U.S. and       |
|   International Copyright Laws. Unauthorized reproduction,        |
|   reverse-engineering, and distribution of all or any portion of  |
|   the code contained in this file is strictly prohibited and may  |
|   result in severe civil and criminal penalties and will be       |
|   prosecuted to the maximum extent possible under the law.        |
|                                                                   |
|   RESTRICTIONS                                                    |
|                                                                   |
|   THIS SOURCE CODE AND ALL RESULTING INTERMEDIATE FILES           |
|   ARE CONFIDENTIAL AND PROPRIETARY TRADE                          |
|   SECRETS OF DEVELOPER EXPRESS INC. THE REGISTERED DEVELOPER IS   |
|   LICENSED TO DISTRIBUTE THE PRODUCT AND ALL ACCOMPANYING .NET    |
|   CONTROLS AS PART OF AN EXECUTABLE PROGRAM ONLY.                 |
|                                                                   |
|   THE SOURCE CODE CONTAINED WITHIN THIS FILE AND ALL RELATED      |
|   FILES OR ANY PORTION OF ITS CONTENTS SHALL AT NO TIME BE        |
|   COPIED, TRANSFERRED, SOLD, DISTRIBUTED, OR OTHERWISE MADE       |
|   AVAILABLE TO OTHER INDIVIDUALS WITHOUT EXPRESS WRITTEN CONSENT  |
|   AND PERMISSION FROM DEVELOPER EXPRESS INC.                      |
|                                                                   |
|   CONSULT THE END USER LICENSE AGREEMENT(EULA FOR INFORMATION ON  |
|   ADDITIONAL RESTRICTIONS.                                        |
|                                                                   |
|___________________________________________________________________|
*/

var isNetscape = window.navigator.appName == 'Netscape';
var autoSelectedValue = '';

function ud() {
}

function TB_SaveReportRDL() {
	ReportingServices.showPrompt(null, "", function (result, reportName) {
		if (result == jsResources.OK && reportName)
			responseServer.ExecuteCommand('saveReportRDL', "reportName=" + reportName, false, TB_SaveCallBack);
	}, { title: jsResources.InputReportRdlName });
}

function TB_SaveCallBack(url, httpRequest) {
	if (httpRequest.status == 200)
		ReportingServices.showOk(jsResources.Complete);
	else
		ReportingServices.showOk(jsResources.ServerError);
}

var tbPropmtReportNameData = {};

function TB_PropmtReportName(
	reportNameFieldID,
	formId,
	action,
	forceNewNameOnSave,
	PostBackScript,
	showCategory,
	additionalCategories,
	dontCreateNewCategories,
	reportNameAlreadyWas) {
	if (reportNameFieldID != null)
		tbPropmtReportNameData.reportNameFieldID = reportNameFieldID;
	if (formId != null)
		tbPropmtReportNameData.formId = formId;
	if (action != null)
		tbPropmtReportNameData.action = action;
	if (forceNewNameOnSave != null)
		tbPropmtReportNameData.forceNewNameOnSave = forceNewNameOnSave;
	if (PostBackScript != null)
		tbPropmtReportNameData.PostBackScript = PostBackScript;
	if (showCategory != null)
		tbPropmtReportNameData.showCategory = showCategory;
	if (additionalCategories != null)
		tbPropmtReportNameData.additionalCategories = additionalCategories;
	if (dontCreateNewCategories != null)
		tbPropmtReportNameData.dontCreateNewCategories = dontCreateNewCategories;
	if (reportNameAlreadyWas == null)
		reportNameAlreadyWas = "";

	//back operation
	reportNameFieldID = tbPropmtReportNameData.reportNameFieldID;
	formId = tbPropmtReportNameData.formId;
	action = tbPropmtReportNameData.action;
	forceNewNameOnSave = tbPropmtReportNameData.forceNewNameOnSave;
	PostBackScript = tbPropmtReportNameData.PostBackScript;
	showCategory = tbPropmtReportNameData.showCategory;
	additionalCategories = tbPropmtReportNameData.additionalCategories;
	dontCreateNewCategories = tbPropmtReportNameData.dontCreateNewCategories;

	// get report name from URL
	var rnIndex = window.location.search.indexOf('rn=');
	var reportName = "";
	var category = "";
	var reportNameField = document.getElementById(reportNameFieldID);
	if (reportNameField != null)
		reportName = reportNameField.value;
	if (!reportName && rnIndex != -1)
		reportName = window.location.search.match(/rn=([^&$]*)/)[1];
	if (reportName != null) {
		reportName = reportName.replace(/%5c/g, jsResources.categoryCharacter);
		reportName = reportName.replace(/%27/g, "'");
		reportName = reportName.replace(/%25/g, "%");
		var lastfolderIndex = reportName.lastIndexOf(jsResources.categoryCharacter);
		if (lastfolderIndex != -1) {
			category = reportName.substring(0, lastfolderIndex);
			reportName = reportName.substr(lastfolderIndex + 1);
		}
	}
	if (reportNameAlreadyWas != "")
		reportName = reportNameAlreadyWas;
	category = category.replace(/\+/g, " ");
	reportName = reportName.replace(/\+/g, " ");
	var UserData = new ud();
	UserData.reportNameFieldID = reportNameFieldID;
	UserData.formId = formId;
	UserData.action = action;
	UserData.forceNewNameOnSave = forceNewNameOnSave;
	UserData.PostBackScript = PostBackScript;
	if (forceNewNameOnSave || !reportName) {
		UserData.checkReportExist = true;
		var genHtml = "<span>" + jsResources.InputReportName + "</span><br><input type='text' value=\"" + reportName + "\" id='promt_input'><br>";
		if (showCategory) {
			if (autoSelectedValue == '')
				autoSelectedValue = category;
			var categoriesHtml = "<select id='promt_input2' style='min-width:136px; max-width: 500px;'></select>";
			genHtml += "<span>" + jsResources.Category + "</span><br>" + categoriesHtml;
		}
		else
			genHtml += "<input style='display:none' type='text' value=\"" + category + "\" id='promt_input2'>";

		// show name/category dialog
		ReportingServices.showConfirm(
			genHtml,
			function (result) {
				TB_PromptCallback(result, document.getElementById("promt_input").value, document.getElementById('promt_input2').value, UserData);
			}, {
				onbeforefit: function () {
					// prepare categories
					var catsArray = [{
						name: ''
					}, {
						name: jsResources.CreateNew
					}];
					var categories = reportCategories.split(",");
					catsArray = catsArray.concat(categories
						.filter(function (f) { return f !== ''; })
						.map(function (c) {
							return { name: c };
						}));
					if (tbPropmtReportNameData.additionalCategories)
						catsArray = catsArray.concat(tbPropmtReportNameData.additionalCategories.map(function (c) {
							return { name: c };
						}));

					// create categories control
					var categoryControl = new AdHoc.Utility.IzendaCategorySelectorControl(jq$('#promt_input2'),
						jsResources.categoryCharacter, stripInvalidCharacters, allowInvalidCharacters);
					categoryControl.setCategories(catsArray);
					categoryControl.select(autoSelectedValue);
					categoryControl.addSelectedHandler(function (val) {
						// "create new" handler:
						if (val === IzLocal.Res('js_CreateNew', '(Create new)')) {
							var input = document.getElementById("promt_input");
							ReportingServices.showPrompt(null, "", TB_OnCategoryChangedCallBack, {
								ctx: { OldReportName: input != null ? input.value : "" },
								title: jsResources.InputNameOfNewCategory
							});
						}
						else
							autoSelectedValue = val;
					});
					// set focus
					ReportingServices.focus(document.getElementById("promt_input"));
				},
				showCaption: false,
				showClose: false
			});
	}
	else {
		UserData.checkReportExist = false;
		TB_PromptCallback(jsResources.OK, reportName, category, UserData);
	}
}

/**
 * "New category" dialog close handler. We need to validate input, add new category and go back to name/category dialog.
 */
function TB_OnCategoryChangedCallBack(result, inputValue, context) {
	if (result == jsResources.OK) {
		if (tbPropmtReportNameData.additionalCategories == null)
			tbPropmtReportNameData.additionalCategories = [];
		// fix user input:
		var fixedInputValue = window.utility.fixReportNamePath(inputValue,
			jsResources.categoryCharacter,
			stripInvalidCharacters,
			allowInvalidCharacters);
		if (!fixedInputValue) {
			// if not valid: show error
			ReportingServices.showOk(IzLocal.Res('InvalidCategoryName', 'Invalid Category Name'), TB_PropmtReportName);
			return false;
		}
		// if valid: add new category
		tbPropmtReportNameData.additionalCategories.push(fixedInputValue);
		// change selected value by default
		autoSelectedValue = fixedInputValue;
	}
	// go back to the report name/category dialog
	TB_PropmtReportName(
		tbPropmtReportNameData.reportNameFieldID,
		tbPropmtReportNameData.formId,
		tbPropmtReportNameData.action,
		true,
		tbPropmtReportNameData.PostBackScript,
		tbPropmtReportNameData.showCategory,
		tbPropmtReportNameData.additionalCategories,
		null,
		context.ctx.OldReportName);
}

function TB_PromptCallback(result, reportName, folderName, UserData) {
	var reportNameFieldID = UserData.reportNameFieldID;
	var formId = UserData.formId;
	var action = UserData.action;
	var forceNewNameOnSave = UserData.forceNewNameOnSave;

	ebc_cancelSubmiting = false;

	if (result == jsResources.OK && reportName != null) {
		reportName =
			window.utility.fixReportNamePath(
				reportName, jsResources.categoryCharacter, stripInvalidCharacters, allowInvalidCharacters);
		if (reportName == null) {
			ReportingServices.showOk(jsResources.InvalidReportName);
			ebc_cancelSubmiting = true;
			return;
		}
		if (folderName)
			reportName = folderName + jsResources.categoryCharacter + reportName;
		var b = SRA_CheckReport(reportName, UserData.checkReportExist);
		if (b.canBeSaved) {
			this.PostBackScript = UserData.PostBackScript;
			var currentContext = this;
			function execute() {
				var reportNameField = document.getElementById(reportNameFieldID);
				if (reportNameField == null) {
					reportNameField = document.getElementsByName(reportNameFieldID);
					reportNameField = reportNameField[0];
				}
				var oldValue = reportNameField.value;
				reportNameField.value = reportName;
				var PostBackScript = this.PostBackScript.replace("__report_name__", reportName);
				PostBackScript = PostBackScript.replace("__old_report_name__", oldValue);
				PostBackScript = PostBackScript.replace("__old_tplrep_name__", oldValue);
				PostBackScript = PostBackScript.replace(/&quot;/g, '"');
				action = action.replace("__report_name__", reportName.replace(/ /g, "+"));
				action = action.replace("__old_report_name__", oldValue.replace(/ /g, "+"));
				action = action.replace("__old_tplrep_name__", oldValue.replace(/ /g, "+"));
				ChangeFormAction(formId, action);
				pause(100);
				ReportingServices.showLoading({ title: jsResources.Saving });
				pause(100);
				var mvcHack = document.getElementsByName("AdHoc_SaveOrSaveAsButtonPressed")[0];
				if (mvcHack != null)
					mvcHack.value = "1";
				theForm.hidden = true;
				theForm.onsubmit = function () {
					for (i = 0; i < theForm.length; i++) {
						if (theForm[i].getAttribute('htmlallowed') == 'true')
							if (theForm[i].value)
								theForm[i].value = theForm[i].value.escapeHtml();
					}
					return true;
				}
				eval(PostBackScript);
			}
			if (b.confirm) {
				ReportingServices.showConfirm(jsResources.AReportWithTheSameNameAlreadyExists, function (result) {
					if (result == jsResources.OK) {
						execute.apply(currentContext);
					}
				});
			} else {
				execute();
			}
		}
	}
	else
		ebc_cancelSubmiting = true;
}

function pause(ms) {
	var now = new Date();
	var exitTime = now.getTime() + ms;
	while (true) {
		now = new Date();
		if (now.getTime() >= exitTime) return;
	}
}

function TB_ShowLimitationMessage() {
	var limitMsg = document.getElementById("limitMsgId");
	if (limitMsg)
		limitMsg.style.display = "block";
}

function TB_WaitForPrint(printWnd) {
	if (!printWnd.document.readyState || printWnd.document.readyState != 'complete') {
		setTimeout(function () { TB_WaitForPrint(printWnd); }, 100);
	}
	else {
		printWnd.print();
	}
}

function TB_ShowDashPrintWindow(address) {
	printwindow = window.open(address);
	setTimeout(function () { TB_WaitForPrint(printwindow); }, 500);
}

function TB_EMailReportServer(reportName) {
	if (reportName == "") {
		ebc_cancelSubmiting = true;
		alert(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	}
	var email = prompt(jsResources.InputRecipientEmailAddress);
	if (email != null && email != "") {
		var eMailField = document.getElementById("TB_EMail");
		eMailField.value = email;
		theForm.onsubmit = function () {
			for (i = 0; i < theForm.length; i++) {
				if (theForm[i].getAttribute('htmlallowed') == 'true')
					if (theForm[i].value)
						theForm[i].value = theForm[i].value.escapeHtml();
			}
			return true;
		}
	}
	else
		ebc_cancelSubmiting = true;
	
}

function TB_EMailReport(reportName, redirectUrl) {
	if (reportName == "") {
		ReportingServices.showOk(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	}
	else {
		try {
			redirectUrl = "mailto:" + redirectUrl.replace(/ /g, "%20");
			window.top.location = redirectUrl;
		}
		catch (e) { }
	}
}

function TB_EMailReportCallback(UserData, email, IsOk) {
	var reportName = UserData.reportName;
	var redirectUrl = UserData.redirectUrl;
	if (email != null && email != "") {
		try {
			redirectUrl = "mailto:" + email + redirectUrl.replace(/ /g, "%20");
			window.top.location = redirectUrl;
		}
		catch (e) { }
	}
}

function TB_EMailReportNoPostback(reportName) {
	if (reportName == "")
		ReportingServices.showOk(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	else {
		ReportingServices.showPrompt(null, "", function (result, email) {
			if (result == jsResources.OK && email != null && email != "")
				responseServer.ExecuteCommand("sendEmail", "address=" + email + "&" + "reportName=" + reportName);
		}, { title: jsResources.InputRecipientEmailAddress });
	}
}

function TB_PublishRdlNoPostback(reportName) {
	if (reportName == "")
		ReportingServices.showOk(jsResources.PleaseSaveYourReportBeforePublishingIt);
	else {
		ReportingServices.showPrompt(null, "", function (result, folderName) {
			if (result == jsResources.OK)
				responseServer.ExecuteCommand("publishRdl", "reportName=" + reportName + "&" + "folderName=" + folderName, false, TB_PublishRdlCallBack);
		}, { title: jsResources.InputFolderName });
	}
}

function TB_PublishRdlCallBack(url, httpRequest) {
	if (httpRequest.status == 200)
		ReportingServices.showOk(jsResources.Complete);
	else
		ReportingServices.showOk(jsResources.ServerError);
}

function ChangeFormAction(formId, action) {
	var form = document.forms[formId];
	if (form != null)
		form.action = action;
}

function TB_ShowUnsupportedImagePopup(url) {
	TB_ShowImagePopup(url, "<br><a href='http://www.izenda.com/adhoc'>This feature is unsupported in Express Edition. Click here to upgrade</a>");
}

var images = {};
function TB_ShowImagePopup(url, html) {
	if (html == null)
		html = "";
	var img = images[url];
	if (img == null) {
		img = new Image;
		img.src = url;
		images[url] = img;
	}

	if (img.onload || img.complete != null) {
		if (!img.onload && img.onload != null) {
			while (img.onload);
		}
		else if (!img.complete) {
			setTimeout("TB_ShowImagePopup(\"" + url.replace("\\", "\\\\") + "\", \"" + html + "\")", 500);
			return;
		}
	}

	ReportingServices.showModal('<div onclick="ReportingServices.hideTip()">{message}<br />\n\
<image src="{url}" />{html}</div>'.format({
			message: jsResources.ClickImageToClose, url: url, html: html
		}));
}

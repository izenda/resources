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
var folderId;
var autoSelectedValue = '';

function ud()
{
}

function TB_SaveReportRDL()
{
	var UserData = new ud();
	ud.reportNameFieldID = "";
	modal_prompt(
		jsResources.InputReportRdlName,
		UserData,
		TB_SaveReportRDLCallback);
}

function TB_SaveReportRDLCallback(UserData,reportName,isOk)
{
	if( isOk && (reportName!=null) && (reportName!=""))
		responseServer.ExecuteCommand(
			'saveReportRDL',
			"reportName=" + reportName,
			false,
			TB_SaveCallBack);
}

function TB_SaveCallBack(url, httpRequest)
{
	if (httpRequest.status == 200)
		modal_ok(jsResources.Complete);
	else
		modal_ok(jsResources.ServerError);
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
	reportNameAlreadyWas)
{
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
	
	var rnIndex = window.location.search.indexOf('rn=');
	var reportName = "";
	var category = "";
	var reportNameField = document.getElementById(reportNameFieldID);
	if (reportNameField != null)
		reportName = reportNameField.value;
	if (reportName == null || reportName == "")
	{
		if (rnIndex!=-1)
		{
			var l = window.location.search.indexOf('&', rnIndex+3);
			if (l==-1)
				reportName = window.location.search.slice(rnIndex+3);
			else
				reportName = window.location.search.slice(rnIndex+3, l);
		}
	}
	if (reportName != null)
	{
		while (reportName != reportName.replace('%5c', jsResources.categoryCharacter))
			reportName = reportName.replace('%5c', jsResources.categoryCharacter);
		while (reportName != reportName.replace("%27", "'"))
		  reportName = reportName.replace("%27", "'");
		while (reportName != reportName.replace("%25", "%"))
		  reportName = reportName.replace("%25", "%");
		var lastfolderIndex = reportName.lastIndexOf(jsResources.categoryCharacter);
		if(lastfolderIndex!=-1)
		{
			category = reportName.substring(0, lastfolderIndex);
			reportName = reportName.substr(lastfolderIndex+1);
		}
	}
	if (reportNameAlreadyWas != "")
		reportName = reportNameAlreadyWas;
	category = category.replace(/\+/g," ");
	reportName = reportName.replace(/\+/g," ");
	var UserData = new ud();
	UserData.reportNameFieldID = reportNameFieldID;
	UserData.formId = formId;
	UserData.action = action;
	UserData.forceNewNameOnSave = forceNewNameOnSave;
	UserData.PostBackScript = PostBackScript;
	if (forceNewNameOnSave || !reportName)
	{
		UserData.checkReportExist = true;
		window.UserDataObject = UserData;
		window.CallBackFunctionName = TB_PromptCallback;
		
		if(folderId!=null)
		{
			var folderControl = document.getElementById(folderId);
			if(folderControl!=null)
			{
				var folderText = folderControl.value;
				if(folderText != null)
					category = folderText;
			}
		}

		var genHtml = "<span>" + jsResources.InputReportName +"</span><br><input type='text' value=\"" + reportName + "\" id='promt_input'><br>";
		if (showCategory)
		{
			if (autoSelectedValue == '')
				autoSelectedValue = category;
			var categories = reportCategories.split(",");
			var categoriesHtml = "<select onchange='TB_OnCategoryChanged(this)' id='promt_input2' style='min-width:136px;'>";
			var indent = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			var currentCategory = new Array();
			var selectedAnything = false;
			for(var i=0;i<categories.length;i++)
			{
				var currentName = "";
				var currentDispalName = "";
				var newCurrentCategory = new Array();
				var subcategories = categories[i].split(categoryCharacter);
				
				var cnt = currentCategory.length;
				if (cnt > subcategories.length)
				  cnt = subcategories.length;
					
				var subcategoriesIndex = 0;
				
				while ((subcategoriesIndex < cnt) && (currentCategory[subcategoriesIndex] == subcategories[subcategoriesIndex]))
				{
					if (currentName != "")
					  currentName += categoryCharacter;
					currentName += subcategories[subcategoriesIndex];
					currentDispalName += indent;
					newCurrentCategory.push(subcategories[subcategoriesIndex]);
					subcategoriesIndex++;
				}
				
				cnt = subcategories.length;
				for (var j=subcategoriesIndex;j<cnt;j++)
				{
					if (currentName != "")
					  currentName += categoryCharacter;
				  currentName += subcategories[j];
				  selected = "";
				  if (!selectedAnything) {
				    var selected = (additionalCategories == null && currentName == category) ? "selected" : "";
				    if (autoSelectedValue == currentName) {
				      selected = "selected";
				      autoSelectedValue = "";
				    }
				    if (selected == "selected")
				      selectedAnything = true;
				  }
					categoriesHtml += "<option value=\"" + currentName + "\" " + selected+ " >" + currentDispalName+subcategories[j] + "</option>";
					currentDispalName += indent;
					newCurrentCategory.push(subcategories[j]);
				}
				
				if (i==0 && !dontCreateNewCategories)
					categoriesHtml += "<option value='CreateNew'>" + jsResources.CreateNew + "</option>";
				currentCategory = newCurrentCategory;
			}
			if (additionalCategories != null) {
			  if (!selectedAnything) {
			    var pos = additionalCategories.indexOf("'" + autoSelectedValue + "'");
			    if (pos > 0) {
			      var tagStr = "'" + autoSelectedValue + "'";
			      var len = tagStr.length;
			      var newAC = additionalCategories.substr(0, pos + len) + " selected " + additionalCategories.substr(pos + len);
			      additionalCategories = newAC;
			    }
			  }
			  categoriesHtml += additionalCategories;
			}
			categoriesHtml += "</select>";
			genHtml += "<span>" + jsResources.Category + "</span><br>" + categoriesHtml + "<br>";
		}
		else
			genHtml += "<input style='display:none' type='text' value=\"" + category + "\" id='promt_input2'>";
		genHtml += "<input type='button' class='iz-button' value='" + jsResources.OK + "' onclick='TB_ModalDialogHide(true)'>&nbsp;";
		genHtml += "<input type='button' class='iz-button' value='" + jsResources.Cancel + "' onclick='TB_ModalDialogHide(false)'>";
		if (isNetscape)
			document.addEventListener('keydown', TB_ModalDialogKeydown, true);
		else
			document.attachEvent('onkeydown', TB_ModalDialogKeydown);

		ShowDialog(genHtml);
		document.getElementById("promt_input").focus();
	}
	else
	{
		UserData.checkReportExist = false;
		TB_PromptCallback(UserData, reportName, category, true);
	}
}

function TB_OnCategoryChanged(obj)
{
	var selectedValue = obj.value;
	if (selectedValue=='CreateNew')
	{
		var UserData = new ud();
		
		var input = document.getElementById("promt_input");
		if (input != null)
			UserData.OldReportName = input.value;
		else
			UserData.OldReportName = "";
		modal_prompt(
			jsResources.InputNameOfNewCategory,
			UserData,
			TB_OnCategoryChangedCallBack);
	}
}

function escapeRegExp(s) {
  return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function TB_OnCategoryChangedCallBack(userData, inputValue, res)
{
	if(res==true)
	{
		var additionalCategories = tbPropmtReportNameData.additionalCategories;
		if (additionalCategories==null)
		  additionalCategories = "";
		additionalCategories = additionalCategories.replace("selected", "");
		tbPropmtReportNameData.additionalCategories = additionalCategories;
		var found = false;
		
		var newCat = inputValue;
		var additionalCharacter = '';
		if (categoryCharacter != '\\')
		  additionalCharacter = escapeRegExp(categoryCharacter);
		var regexp = new RegExp("[^A-Za-z0-9_/" + additionalCharacter + "\\-'' \\\\]", 'g');
		if (stripInvalidCharacters)
		{
		  newCat = newCat.replace(regexp, '');
			if (newCat.length == 0) 
			{
				modal_ok("Category Name invalid. Please provide a valid category name.", null, TB_PropmtReportName);
				return false;
			}
		}
		else 
		{
		  var pos = newCat.search(regexp);
			if (pos != -1 && !allowInvalidCharacters) 
			{
				modal_ok("Category Name invalid. Please provide a valid category name.", null, TB_PropmtReportName);
				return false;
			}
		}
		
		var newInLower = newCat.toLowerCase();
		var existingCats = reportCategories.split(',');
		for (var i = 0; i < existingCats.length; i++) 
		{
			if (existingCats[i].toLowerCase() == newInLower) 
			{
				newCat = existingCats[i];
				found = true;
				break;
			}
		}
		if (!found) 
		{
			var addedCats = additionalCategories.split('\'');
			j = -1;
			while (j < addedCats.length - 2)
			{
				j += 2;
				if (addedCats[j].toLowerCase() == newInLower)
				{
					newCat = addedCats[j];
					found = true;
					break;
				}		    
			}
		}
		if (!found) 
		{
			additionalCategories += "<option value=\"" + newCat + "\" selected >" + newCat + "</option>";
			tbPropmtReportNameData.additionalCategories = additionalCategories;
		}
		else 
		{
			autoSelectedValue = newCat;		  
		}
	}
	TB_PropmtReportName(
		tbPropmtReportNameData.reportNameFieldID,
		tbPropmtReportNameData.formId,
		tbPropmtReportNameData.action,
		true,
		tbPropmtReportNameData.PostBackScript,
		tbPropmtReportNameData.showCategory,
		tbPropmtReportNameData.additionalCategories,
		null, 
		userData.OldReportName);	
}


function TB_ModalDialogHide(res) {
	var input = document.getElementById('promt_input');
	var input2 = document.getElementById('promt_input2');
	hm();
	if (input == null || input2 == null)
		return;

	if (isNetscape)
		document.removeEventListener('keydown', modal_promt_keydown, true);
	else
		document.detachEvent('onkeydown', modal_promt_keydown);

	if (CallBackFunctionName != null)
		window.CallBackFunctionName(window.UserDataObject, input.value, input2.value, res);
}

function TB_ModalDialogKeydown(evt)
{
	evt = (evt) ? evt : window.event;
	if (evt.keyCode == 10 || evt.keyCode == 13)
		TB_ModalDialogHide(true);
	if (evt.keyCode == 27)
		TB_ModalDialogHide(false);
}

function TB_PromptCallback(UserData, reportName, folderName, isOk) {
	var reportNameFieldID = UserData.reportNameFieldID;
	var formId = UserData.formId;
	var action = UserData.action;
	var forceNewNameOnSave = UserData.forceNewNameOnSave;
	var PostBackScript = UserData.PostBackScript;
	
	ebc_cancelSubmiting = false;

	if(isOk&&(reportName!=null))
	{
		reportName = SRA_ProcessReportName(reportName, folderName);
		if (reportName == null) {
			ShowDialog("<span>"+jsResources.InvalidReportName+"</span><br/><input type='button' onclick='TB_ModalDialogHide(true)' value='OK'>");
			ebc_cancelSubmiting = true;
			return;
		}
		var b = SRA_CheckReport(reportName, UserData.checkReportExist);
		if (b)
		{
			var reportNameField = document.getElementById(reportNameFieldID);
			if(reportNameField==null)
			{
				reportNameField = document.getElementsByName(reportNameFieldID);
				reportNameField = reportNameField[0];
			}
			var oldValue = reportNameField.value;
			reportNameField.value = reportName;
			var PostBackScript = PostBackScript.replace("__report_name__", reportName);
			var PostBackScript = PostBackScript.replace("__old_report_name__", oldValue);
			var PostBackScript = PostBackScript.replace("__old_tplrep_name__", oldValue);
			PostBackScript = PostBackScript.replace(/&quot;/g,'"');
			action = action.replace("__report_name__", reportName.replace(/ /g, "+"));
			action = action.replace("__old_report_name__", oldValue.replace(/ /g, "+"));
			action = action.replace("__old_tplrep_name__", oldValue.replace(/ /g, "+"));
			ChangeFormAction(formId, action);
			pause(100);
			ShowDialog(jsResources.Saving + "...<br><image src='" + responseServerWithDelimeter + "image=loading.gif'/>");
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

function TB_ShowLimitationMessage()
{
	var limitMsg = document.getElementById("limitMsgId");
	if (limitMsg)
		limitMsg.style.display = "block";
}

function TB_WaitForPrint(printWnd) {
  if (!printWnd.document.readyState || printWnd.document.readyState != 'complete') {
    setTimeout(function() { TB_WaitForPrint(printWnd); }, 100);
  }
  else {
    printWnd.print();
  }
}

function TB_ShowDashPrintWindow(address) {
  printwindow = window.open(address);
  setTimeout( function() { TB_WaitForPrint(printwindow); } , 500);
}

function TB_EMailReportServer(reportName)
{
	if(reportName=="")
	{
		ebc_cancelSubmiting = true;
		alert(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	}
	var email = prompt(jsResources.InputRecipientEmailAddress);
	if(email!=null && email!="")
	{
		var eMailField = document.getElementById("TB_EMail");
		eMailField.value = email;
	}
	else
		ebc_cancelSubmiting = true;
	
}

function TB_EMailReport(reportName, redirectUrl)
{
	if(reportName=="")
	{
		modal_ok(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	}
	else
	{	
		try
		{
			redirectUrl = "mailto:" + redirectUrl.replace(/ /g, "%20");
			window.top.location = redirectUrl;
		}
		catch(e) {}
	}
}

function TB_EMailReportCallback(UserData,email,IsOk)
{
		var reportName = UserData.reportName;
		var redirectUrl = UserData.redirectUrl;
		if(email!=null && email!="")
		{
			try 
			{
				redirectUrl = "mailto:" + email + redirectUrl.replace(/ /g, "%20");
				window.top.location = redirectUrl;
			}
			catch(e) {}
		}
}

function TB_EMailReportNoPostback(reportName)
{
	if(reportName=="")
		modal_ok(jsResources.YouMustSaveAReportBeforeItCanBeEmailed);
	else
	{
		var UserData = new ud();
		UserData = reportName;
		modal_prompt(
			jsResources.InputRecipientEmailAddress,
			UserData,
			TB_EMailReportNoPostbackCallBack);
	}
}

function TB_PublishRdlNoPostback(reportName)
{
	if(reportName=="")
		modal_ok(jsResources.PleaseSaveYourReportBeforePublishingIt);
	else
	{
		var UserData = new ud();
		UserData.reportName = reportName;
		modal_prompt(
			jsResources.InputFolderName,
			UserData,
			TB_PublishRdlNoPostbackCallBack);
	}
}

function TB_PublishRdlNoPostbackCallBack(UserData, folderName, IsOk)
{
	if (IsOk)
	{
		var reportName = UserData.reportName;
		responseServer.ExecuteCommand("publishRdl", "reportName=" + reportName + "&" + "folderName=" + folderName, false, TB_PublishRdlCallBack);
	}
}

function TB_PublishRdlCallBack(url, httpRequest)
{
	if (httpRequest.status == 200)
		modal_ok(jsResources.Complete);
	else
		modal_ok(jsResources.ServerError);
}

function TB_EMailReportNoPostbackCallBack(UserData,email,IsOk)
{
	var reportName = UserData;
	if(email!=null && email!="")
	  responseServer.ExecuteCommand("sendEmail", "address=" + email + "&" + "reportName=" + reportName);
}

function ChangeFormAction(formId, action)
{
	var form = document.forms[formId];
	if(form!=null)
		form.action = action;
}

function TB_ShowUnsupportedImagePopup(url)
{
	TB_ShowImagePopup(url, "<br><a href='http://www.izenda.com/adhoc'>This feature is unsupported in Express Edition. Click here to upgrade</a>");
}

var images = {};
function TB_ShowImagePopup(url, html)
{
	if(html==null)
		html = "";
	var img = images[url];
	if (img==null)
	{
		img = new Image;
		img.src = url;
		images[url] = img;
	}

	var iw;
	var ih;

	if (!img.onload && img.complete==null)
	{
		var genHtml = '<div onclick="hm()">' + jsResources.ClickImageToClose + '<br><image src="' + url + '" onclick="hm()" />' + html + '</div>';
		ShowDialog(genHtml, 200, 20);
	}
	else
	{
		if(!img.onload && img.onload!=null)
		{
			while (img.onload);
		}
		else
		{
			if(!img.complete)
			{
				setTimeout("TB_ShowImagePopup(\"" + url.replace("\\","\\\\") + "\", \"" + html + "\")", 500);
				return;
			}
		}
	
		iw=img.width;
		ih=img.height;

		var genHtml = '<div onclick="hm()">' + jsResources.ClickImageToClose + '<br><image src="' + url + '" onclick="hm()" width=' + iw + ' height=' + ih + ' />' + html + '</div>';
		ShowDialog(genHtml, iw, ih);
	}
}

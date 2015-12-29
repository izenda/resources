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

function TriggerMvcSave() {
    var mvcHack = document.getElementsByName("AdHoc_SaveButtonPressed")[0];
    if (mvcHack != null)
        mvcHack.value = "1";
}

function getElementByAttribute(attr, value, root) {
  if (root == null)
    root = document.body;
  if (root.getAttribute(attr) != null && root.getAttribute(attr) == value)
    return root;
  var children = root.children;
  for (var i = 0; i<children.length; i++ ) {
    element = getElementByAttribute(attr, value, children[i]);
    if (element)
      return element;
  }
  return null;
}

function getElementByIdPart(value, root) {
  if (root == null)
    root = document.body;
  if (root.id != null && root.id.indexOf(value) != -1)
    return root;
  var children = root.children;
  for (var i = 0; i < children.length; i++) {
    element = getElementByIdPart(value, children[i]);
    if (element)
      return element;
  }
  return null;
}

function S_GenerateExampleCode(propertyName, pageID, vb)
{
	var propertyID = pageID+"_"+propertyName;
	var Item = document.getElementById(propertyID);
	var value;
	if (Item != null) {
		var typeItem = Item.type;
		if (typeItem == null)
			typeItem = Item.getAttribute('type');
		var value;
		if (typeItem == 'checkbox') {
			value = Item.checked;
		}
		else if (typeItem == 'radioGroup') {
			var rows = Item.rows;
			for (var j=0;j<rows.length;j++) {
				var cells = rows[j].cells;
				for (var i=0;i<cells.length; i++) {
					var Node = cells[i].childNodes[0];
					if (Node.checked) 
						value = Node.value;
				}
			}
		}
		else {
			value= Item.value;
		}
	}
	try {
		var newval = value.replace("\n", "|");
		while (newval != value) {
			value = newval;
			newval = value.replace("\n", "|");
		}
	} catch (e) {}
	if (propertyName == "VisibleDataSources") {
		value = "";
		Item = document.getElementById(pageID + "_VisibleDataSources");
		if (Item != null) {
			var rows = Item.rows;
			for (var j=0;j<rows.length;j++) {
				var cells = rows[j].cells;
				for (var i=0;i<cells.length; i++) {
					var Node = cells[i].childNodes[0];
					var name = Node.name+"";
					name = name.replace("VisibleDataSources_", "");
					if (Node.checked) 
						value += name + "|";
				}
			}
		}
	}
	if (propertyName == "ConnectionString"){
		Item = document.getElementById(pageID+"_ServerType");
		value = Item.value;
	}
	var vbstr = "";
	if (vb)
	  vbstr = "vb=1" + "&"
	var messageInfo = "Generate C# code: ";
	if (vb)
		messageInfo = "Generate VB code: ";
	S_ShowProgressMessage("GetCodeSample_"+propertyID, "<b>"+messageInfo+"</b> " + propertyName);
	responseServer.ExecuteCommand(
		"generateExampleCode",
		vbstr+"Property=" + propertyName + "&" + "Value='" + value+"'",
		true,
		S_OnServerResponseGenerateExampleCode, propertyID);
}

function S_OnServerResponseGenerateExampleCode(url, httpRequest, propertyID)
{
	if (!S_CloseProgressMessage("GetCodeSample_"+propertyID))
		return;
	var Item = document.getElementById(propertyID);
	var result = httpRequest.responseText;
	if (result.length < 3 || result.substring(0, 3) != "ok_")
	{
		var Html = "<div>";
		Html += "<nobr>Generate exaple code for "+Item.name + " failed.</nobr>";
		Html += "<br>";
		Html += "<nobr>Server did not response.</nobr>"
		Html += "</div>";
		Html += "<input type='button' value='Close' onclick='hm()'>"
		ShowDialog(Html);
		return;
	}
	result = result.substring(3);
	S_ShowCodeSample(result);
}

function S_ShowCodeSample(text)
{
	var html = "<div align=left width=80%>"+text+"</div>";
	html += "<input type='button' value='Close' onclick='hm()'>"
	ShowDialog(html);
}

function S_GetDefaultValue(propertyName, pageID)
{
	var propertyID = pageID+"_"+propertyName;
	var Item = document.getElementById(propertyID);
	if (Item != null)
	{
		if (propertyName == "VisibleDataSources")
		{
			var AllTables = document.getElementsByName("AllTablesSelected")[0];
			AllTables.checked = true;
			
			Item = document.getElementById(pageID + "_VisibleDataSources");
			if (Item != null) {
				var rows = Item.rows;
				for (var j=0;j<rows.length;j++) {
					var cells = rows[j].cells;
					for (var i=0;i<cells.length; i++) {
						var Node = cells[i].childNodes[0];
						if (Node.value == "on")
							Node.checked = false;
					}
				}
			}
		}
		else
		{
			var defaultValue = Item.getAttribute("defaultSettingsValue");
			var typeItem = Item.type;
			if (typeItem == null)
				typeItem = Item.getAttribute('type');
				
			if (defaultValue != null)
			{
				if (typeItem == 'checkbox')
				{
					Item.checked = (defaultValue == 'checked');
				}
				else if (typeItem == 'radioGroup')
				{
					var rows = Item.rows;
					for (var j=0;j<rows.length;j++) {
						var cells = rows[j].cells;
						for (var i=0;i<cells.length; i++) {
							var Node = cells[i].childNodes[0];
							Node.checked = (Node.value == defaultValue);
						}
					}
				}
				else
				{
					Item.value = defaultValue;
				}
			}
		}
	}
}

function S_ShowErrorMessage(message)
{
	var html = "<div>"
	html += "<nobr><b style='color:red;'>Failed to save to Izenda.config</b></nobr><br>"
	html += "<nobr><a style='color:red;'>";
	html += message;
	html += "</a></nobr></div>";
	html += "<input type='button' value='Close' onclick='hm()'>"
	ShowDialog(html);
}

function S_ShowAllTablesClick(pageID)
{
	var Item = document.getElementById(pageID + "_VisibleDataSources");
	if (Item != null) {
		var rows = Item.rows;
		for (var j=0;j<rows.length;j++) {
			var cells = rows[j].cells;
			for (var i=0;i<cells.length; i++) {
				var Node = cells[i].childNodes[0];
				if (Node.value == "on")
					Node.checked = false;
			}
		}
	}
	var AllTables = document.getElementsByName("AllTablesSelected")[0];
	AllTables.checked = true;
}

function S_ShowTableClick(pageID)
{
	var allNotChecked = true;
	var Item = document.getElementById(pageID + "_VisibleDataSources");
	if (Item != null) {
		var rows = Item.rows;
		for (var j=0;j<rows.length;j++) {
			var cells = rows[j].cells;
			for (var i=0;i<cells.length; i++) {
				var Node = cells[i].childNodes[0];
				if (Node.value == "on")
					allNotChecked = (allNotChecked && (Node.checked == false));
			}
		}
	}
	var AllTables = document.getElementsByName("AllTablesSelected")[0];
	AllTables.checked = allNotChecked;
}

function S_UpdateSchema()
{
	responseServer.ExecuteCommand("updateSchema", "", true, S_OnServerResponseUpdateSchema);
}

function S_OnServerResponseUpdateSchema(url, httpRequest)
{
	var result = httpRequest.responseText;
	S_ShowCodeSample(result);
}

var S_ShownMessageCount = 0;
var S_Messages = {};
var S_MessageByID = {};

function S_ShowProgressMessage(messageID, messageText)
{
	if (S_MessageByID[messageID] != null)
		return;
	var obody=document.getElementsByTagName('body')[0];
	var frag=document.createDocumentFragment();
	
	var newMessage = document.createElement('div');
	
	newMessage = document.createElement('div');
	newMessage.style.border = "darkgray 1px outset";
	newMessage.style.width = "300px";
	newMessage.style.height = "auto";
	newMessage.style.color = "black";
	newMessage.style.backgroundColor = "white";
	newMessage.style.position = "absolute";
	newMessage.innerHTML = messageText;
	
	frag.appendChild(newMessage);
	obody.insertBefore(frag,obody.firstChild);
	
	var msgInfo = {};
	msgInfo.msg = newMessage;
	msgInfo.number = S_ShownMessageCount;
	msgInfo.ID = messageID;
	
	S_MessageByID[messageID] = msgInfo;
	S_Messages[S_ShownMessageCount] = msgInfo;
	S_ShownMessageCount += 1;
	
	S_HideAllMessages();
	S_ShowAllMessages();
}

function S_CloseProgressMessage(messageID)
{
	if (S_MessageByID[messageID] == null)
		return false;
	var msgInfo = S_MessageByID[messageID];
	msgInfo.msg.style.visibility = "hidden";
	msgInfo.msg.style.display = "none";
	
	var n = msgInfo.number;
	for (var i=n+1;i<S_ShownMessageCount;i++)
	{
		msgInfo = S_Messages[i];
		msgInfo.number = i-1;
		S_Messages[i-1] = msgInfo;
		S_MessageByID[msgInfo.ID] = msgInfo;
	}
	S_ShownMessageCount += -1;
	S_MessageByID[messageID] = null;
	S_HideAllMessages();
	S_ShowAllMessages();
	return true;
}

function S_HideAllMessages()
{
	for (var i=0;i<S_ShownMessageCount;i++)
	{
		S_Messages[i].msg.style.visibility="hidden";
		S_Messages[i].msg.style.display = "none";
	}
}

function S_ShowAllMessages()
{
	var topMsg = 2;
	var leftMsg = document.body.clientWidth - 300 - 2;
	for (var i=0;i<S_ShownMessageCount;i++)
	{
		S_Messages[i].msg.style.left = leftMsg + 'px';
		S_Messages[i].msg.style.top = topMsg + 'px';
		S_Messages[i].msg.style.display = "";
		S_Messages[i].msg.style.visibility = "visible";
		var tooltip_height=(S_Messages[i].msg.style.pixelHeight)? S_Messages[i].msg.style.pixelHeight : S_Messages[i].msg.offsetHeight;
		topMsg += tooltip_height + 2;
	} 
}

function S_ViewsOnly(pageID)
{
	var viewItem = document.getElementById(pageID + "_ViewsOnly");
	var isViewOnly = false;
	if (viewItem != null && viewItem.checked != null)
		var isViewOnly = viewItem.checked;
	else
		return;

	var Item = document.getElementById(pageID + "_VisibleDataSources");
	if (Item != null) {
		var rows = Item.rows;
		for (var j=0;j<rows.length;j++) {
			var cells = rows[j].cells;
			for (var i=0;i<cells.length; i++) {
				var Node = cells[i].childNodes[0];
				var isView = (Node.attributes["isView"].value == "True");
				if (!isView)
				{
					Node.checked = false;
					Node.disabled = isViewOnly;
				}
			}
		}
	}
	S_ShowTableClick(pageID);
}

function S_ShowDetails(e)
{
	var src = e.srcElement || e.target;
	while(src.tagName != 'TD')
		src = src.parentNode;
	do{
		src = src.previousSibling;
	}while(src.tagName != 'TD')
	while(src.tagName != 'NOBR')
		src = src.firstChild;
	var html = "<div style='max-width:800px;text-align:center;margin-bottom:20px'>"
	html += "<div style='margin-bottom:10px;'><nobr>" + src.innerHTML + "</nobr></div>"
	html += "<div style='white-space:normal;max-width:780px'>";
	html += src.title;
	html += "</div>";
	var setting = src.attributes["setting"];
	html += "<input type='button' style='margin-right:20px;float:right' value='Close' onclick='hm()'></div>";
	ShowDialog(html);
}

function S_SelectConnectionShowDialog()
{
	jq$("#cswServerNameRow").show();
	jq$("#cswDatabaseRow").show();
	jq$("#cswAuthTypeRow").show();
	jq$("#cswLoginRow").show();
	jq$("#cswPasswordRow").show();
	
	//if (serverType == "Oracle")
	//jQuery("#cswDatabaseRow").hide();
	//if (serverType == "MySql" || serverType == "Db2")
	//	jQuery("#cswAuthTypeRow").hide();
		
	//if (jQuery("#cswAuthTypeRow").is(":visible") && jQuery("#cswAuthType").val() == "system"){
	//	jQuery("#cswLoginRow").hide();
	//	jQuery("#cswPasswordRow").hide();
	//}
	
	var wizard = jq$("#cswConnectionWizardContainer");
	wizard.css("position","absolute");
	wizard.css("top", ((jq$(window).height() - wizard.outerHeight()) / 2) + jq$(window).scrollTop() + "px");
	wizard.css("left", ((jq$(window).width() - wizard.outerWidth()) / 2) + jq$(window).scrollLeft() + "px");
	jq$(wizard).show();
}

function S_ToggleWizardVisibility(typeControl)
{
	var serverType = jQ(typeControl).val();
	if (serverType == "SqlServer")
		jq$("#csvShowWizardButton").show();
	else{
		jq$("#csvShowWizardButton").hide();
		if (jq$("#cswConnectionWizardContainer").is(":visible"))
			jq$("#cswConnectionWizardContainer").hide();
	}
}

function S_AuthTypeChange(select)
{
	if (jq$(select).val() == "system"){
		jq$("#cswLoginRow").hide();
		jq$("#cswPasswordRow").hide();
		if (jq$("#cswServerName").val() == "")
			jq$("#cswServerName").val("(local)");
	}
	else{
		jq$("#cswLoginRow").show();
		jq$("#cswPasswordRow").show();
		if (jq$("#cswServerName").val() == "(local)")
			jq$("#cswServerName").val("");
	}
}

function S_WizardOk(stringControl)
{
	//var serverType = jQuery(typeControl).val();
	var serverType = "SqlServer";
	
	var authType = jq$("#cswAuthType").val();
	var serverName = jq$("#cswServerName").val();
	var databaseName = jq$("#cswDatabase").val();
	var login = jq$("#cswLogin").val();
	var password = jq$("#cswPassword").val();
	var additional = jq$("#cswAdditionalSettings").val();
	
	var connectionString = S_GenerateConnectionString(serverType, authType, serverName, databaseName, login, password, additional);
	jq$(document.getElementById(stringControl)).val(connectionString);
	
	jq$("#cswConnectionWizardContainer").hide();
}

function S_GenerateConnectionString(serverType, authType, server, database, login, password, options)
{
	var connectionString = "";
	
	if (serverType == "SqlServer"){
		connectionString = "server=" + server + ";database=" + database + ";";
		if (authType == "system")
			connectionString += "Trusted_Connection=True;";
		else
			connectionString += "User Id=" + login + ";Password=" + password + ";";
	}
	else if (serverType == "Oracle"){
		connectionString = "Data Source=" + server + ";";
		if (authType == "system")
			connectionString += "Integrated Security=SSPI;";
		else
			connectionString += "User Id=" + login + ";Password=" + password + ";";
	}
	else if (serverType == "MySql"){
		connectionString = "Server=" + server + ";Database=" + database + ";";
		connectionString += "Uid=" + login + ";Pwd=" + password + ";";
	}
	else if (serverType == "Db2"){
		connectionString = "Server=" + server + ";Database=" + database + ";";
		connectionString += "UID=" + login + ";PWD=" + password + ";";
	}
	if (options != undefined && options != "")
		connectionString += options + ";";
	
	return connectionString;
}

function S_WizardCancel()
{
	jq$("#cswConnectionWizardContainer").hide();
}

function S_Open(to)
{
	var newWin = open('http://www.izenda.com/Site/CodeSample/CodeSample.aspx?setting=' + to);
}
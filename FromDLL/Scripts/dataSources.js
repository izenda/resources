//Some common util methods------------------------------------------------------------------
var initializingRoutines = true;
var needActivate = false;

function SetWaitingCursor() {
  document.body.style.cursor = 'wait';
}

function SetDefaultCursor() {
  document.body.style.cursor = 'default';
}

function SetStatus(status) {
  document.getElementById('statusEd').innerHTML = status;
}

function FindNodeById(nodeId, nodes) {
  var foundNode = null;
  for (var index = 0; index < nodes.get_length(); index++) {
    var node = nodes.getNode(index);
    if (node.get_value() == nodeId)
      return node;
    var children = node.get_nodes();
    if (children.get_length() > 0)
      foundNode = FindNodeById(nodeId, children);
    if (foundNode != null)
      break;
  }
  return foundNode;
}

function FindParent(parentId) {
  if (parentId == '')
    return ftw;
  return FindNodeById(parentId, ftw.get_nodes());
}

function QS_GenerateConnectionString(serverType, authType, server, database, login, password, options) {
  var connectionString = "";
  if (serverType == "SqlServer") {
    connectionString = "server=" + server + ";database=" + database + ";";
    if (authType == "system")
      connectionString += "Trusted_Connection=True;";
    else
      connectionString += "User Id=" + login + ";Password=" + password + ";";
  }
  else if (serverType == "Oracle") {
    connectionString = "Data Source=" + server + ";";
    if (authType == "system")
      connectionString += "Integrated Security=SSPI;";
    else
      connectionString += "User Id=" + login + ";Password=" + password + ";";
  }
  else if (serverType == "MySql") {
    connectionString = "Server=" + server + ";Database=" + database + ";";
    connectionString += "Uid=" + login + ";Pwd=" + password + ";";
  }
  else if (serverType == "Db2") {
    connectionString = "Server=" + server + ";Database=" + database + ";";
    connectionString += "UID=" + login + ";PWD=" + password + ";";
  }
  if (options != undefined && options != "")
    connectionString += options + ";";
  return connectionString;
}

function QS_AuthTypeChange(select) {
  if (select.value == "system") {
    document.getElementById('cswLoginRow').style.display = 'none';
    document.getElementById('cswPasswordRow').style.display = 'none';
    if (document.getElementById('cswServerName').value == '')
      document.getElementById('cswServerName').value = '(local)';
  }
  else {
    document.getElementById('cswLoginRow').style.display = '';
    document.getElementById('cswPasswordRow').style.display = '';
    if (document.getElementById('cswServerName').value == '(local)')
      document.getElementById('cswServerName').value = '';
  }
}

function FillProperty(data) {
  var checkBox = document.getElementById('checkBoxVal');
  var editBox = document.getElementById('editBoxVal');
  var selectBox = document.getElementById('selectBoxVal');
  var applyBtn = document.getElementById('applySetting');
  var snImg = document.getElementById('settingNameImg');
  checkBox.style.display = 'none';
  editBox.style.display = 'none';
  selectBox.style.display = 'none';
  applyBtn.style.display = 'none';
  snImg.style.display = '';
  snImg.src = 'rs.aspx?image=jQuery.cross.png';
  if (data == null || data.length == 'undefined' || data.length < 2)
    return;
  snImg.src = 'rs.aspx?image=jQuery.check.png';
  applyBtn.style.display = '';
  var startInd = 0;
  var value = data[startInd];
  startInd++;
  var typeName = data[startInd];
  startInd++;
  if (typeName == 'bool') {
    checkBox.style.display = '';
    checkBox.checked = false;
    if (value == 'True')
      checkBox.checked = true;
  }
  if (typeName == 'string') {
    editBox.style.display = '';
    editBox.value = value;
  }
  if (typeName == 'enum') {
    selectBox.style.display = '';
    while (selectBox.length > 0)
      selectBox.remove(0);
    while (startInd < data.length) {
      var newOption = new Option(data[startInd], data[startInd]);
      if (data[startInd] == value)
        newOption.selected = true;
      try {
        selectBox.add(newOption, null);
      }
      catch (e) {
        selectBox.add(newOption);
      }
      startInd++;
    }
  }
}

//Ajax request for JSON methods-----------------------------------------------------------
/*! JSON v3.3.0 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
(function(n){function K(p,q){function s(a){if(s[a]!==v)return s[a];var c;if("bug-string-char-index"==a)c="a"!="a"[0];else if("json"==a)c=s("json-stringify")&&s("json-parse");else{var e;if("json-stringify"==a){c=q.stringify;var b="function"==typeof c&&r;if(b){(e=function(){return 1}).toJSON=e;try{b="0"===c(0)&&"0"===c(new A)&&'""'==c(new B)&&c(t)===v&&c(v)===v&&c()===v&&"1"===c(e)&&"[1]"==c([e])&&"[null]"==c([v])&&"null"==c(null)&&"[null,null,null]"==c([v,t,null])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==
c({a:[e,!0,!1,null,"\x00\b\n\f\r\t"]})&&"1"===c(null,e)&&"[\n 1,\n 2\n]"==c([1,2],null,1)&&'"-271821-04-20T00:00:00.000Z"'==c(new D(-864E13))&&'"+275760-09-13T00:00:00.000Z"'==c(new D(864E13))&&'"-000001-01-01T00:00:00.000Z"'==c(new D(-621987552E5))&&'"1969-12-31T23:59:59.999Z"'==c(new D(-1))}catch(f){b=!1}}c=b}if("json-parse"==a){c=q.parse;if("function"==typeof c)try{if(0===c("0")&&!c(!1)){e=c('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var l=5==e.a.length&&1===e.a[0];if(l){try{l=!c('"\t"')}catch(d){}if(l)try{l=
1!==c("01")}catch(h){}if(l)try{l=1!==c("1.")}catch(m){}}}}catch(X){l=!1}c=l}}return s[a]=!!c}p||(p=n.Object());q||(q=n.Object());var A=p.Number||n.Number,B=p.String||n.String,G=p.Object||n.Object,D=p.Date||n.Date,J=p.SyntaxError||n.SyntaxError,N=p.TypeError||n.TypeError,R=p.Math||n.Math,H=p.JSON||n.JSON;"object"==typeof H&&H&&(q.stringify=H.stringify,q.parse=H.parse);var G=G.prototype,t=G.toString,u,C,v,r=new D(-0xc782b5b800cec);try{r=-109252==r.getUTCFullYear()&&0===r.getUTCMonth()&&1===r.getUTCDate()&&
10==r.getUTCHours()&&37==r.getUTCMinutes()&&6==r.getUTCSeconds()&&708==r.getUTCMilliseconds()}catch(Y){}if(!s("json")){var E=s("bug-string-char-index");if(!r)var w=R.floor,S=[0,31,59,90,120,151,181,212,243,273,304,334],F=function(a,c){return S[c]+365*(a-1970)+w((a-1969+(c=+(1<c)))/4)-w((a-1901+c)/100)+w((a-1601+c)/400)};(u=G.hasOwnProperty)||(u=function(a){var c={},e;(c.__proto__=null,c.__proto__={toString:1},c).toString!=t?u=function(a){var c=this.__proto__;a=a in(this.__proto__=null,this);this.__proto__=
c;return a}:(e=c.constructor,u=function(a){var c=(this.constructor||e).prototype;return a in this&&!(a in c&&this[a]===c[a])});c=null;return u.call(this,a)});var T={"boolean":1,number:1,string:1,undefined:1};C=function(a,c){var e=0,b,f,l;(b=function(){this.valueOf=0}).prototype.valueOf=0;f=new b;for(l in f)u.call(f,l)&&e++;b=f=null;e?C=2==e?function(a,c){var e={},b="[object Function]"==t.call(a),f;for(f in a)b&&"prototype"==f||u.call(e,f)||!(e[f]=1)||!u.call(a,f)||c(f)}:function(a,c){var e="[object Function]"==
t.call(a),b,f;for(b in a)e&&"prototype"==b||!u.call(a,b)||(f="constructor"===b)||c(b);(f||u.call(a,b="constructor"))&&c(b)}:(f="valueOf toString toLocaleString propertyIsEnumerable isPrototypeOf hasOwnProperty constructor".split(" "),C=function(a,c){var e="[object Function]"==t.call(a),b,g;if(g=!e)if(g="function"!=typeof a.constructor)g=typeof a.hasOwnProperty,g="object"==g?!!a.hasOwnProperty:!T[g];g=g?a.hasOwnProperty:u;for(b in a)e&&"prototype"==b||!g.call(a,b)||c(b);for(e=f.length;b=f[--e];g.call(a,
b)&&c(b));});return C(a,c)};if(!s("json-stringify")){var U={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"},x=function(a,c){return("000000"+(c||0)).slice(-a)},O=function(a){for(var c='"',b=0,g=a.length,f=!E||10<g,l=f&&(E?a.split(""):a);b<g;b++){var d=a.charCodeAt(b);switch(d){case 8:case 9:case 10:case 12:case 13:case 34:case 92:c+=U[d];break;default:if(32>d){c+="\\u00"+x(2,d.toString(16));break}c+=f?l[b]:a.charAt(b)}}return c+'"'},L=function(a,c,b,g,f,l,d){var h,m,k,n,p,q,r,s,y;try{h=
c[a]}catch(z){}if("object"==typeof h&&h)if(m=t.call(h),"[object Date]"!=m||u.call(h,"toJSON"))"function"==typeof h.toJSON&&("[object Number]"!=m&&"[object String]"!=m&&"[object Array]"!=m||u.call(h,"toJSON"))&&(h=h.toJSON(a));else if(h>-1/0&&h<1/0){if(F){n=w(h/864E5);for(m=w(n/365.2425)+1970-1;F(m+1,0)<=n;m++);for(k=w((n-F(m,0))/30.42);F(m,k+1)<=n;k++);n=1+n-F(m,k);p=(h%864E5+864E5)%864E5;q=w(p/36E5)%24;r=w(p/6E4)%60;s=w(p/1E3)%60;p%=1E3}else m=h.getUTCFullYear(),k=h.getUTCMonth(),n=h.getUTCDate(),
q=h.getUTCHours(),r=h.getUTCMinutes(),s=h.getUTCSeconds(),p=h.getUTCMilliseconds();h=(0>=m||1E4<=m?(0>m?"-":"+")+x(6,0>m?-m:m):x(4,m))+"-"+x(2,k+1)+"-"+x(2,n)+"T"+x(2,q)+":"+x(2,r)+":"+x(2,s)+"."+x(3,p)+"Z"}else h=null;b&&(h=b.call(c,a,h));if(null===h)return"null";m=t.call(h);if("[object Boolean]"==m)return""+h;if("[object Number]"==m)return h>-1/0&&h<1/0?""+h:"null";if("[object String]"==m)return O(""+h);if("object"==typeof h){for(a=d.length;a--;)if(d[a]===h)throw N();d.push(h);y=[];c=l;l+=f;if("[object Array]"==
m){k=0;for(a=h.length;k<a;k++)m=L(k,h,b,g,f,l,d),y.push(m===v?"null":m);a=y.length?f?"[\n"+l+y.join(",\n"+l)+"\n"+c+"]":"["+y.join(",")+"]":"[]"}else C(g||h,function(a){var c=L(a,h,b,g,f,l,d);c!==v&&y.push(O(a)+":"+(f?" ":"")+c)}),a=y.length?f?"{\n"+l+y.join(",\n"+l)+"\n"+c+"}":"{"+y.join(",")+"}":"{}";d.pop();return a}};q.stringify=function(a,c,b){var g,f,l,d;if("function"==typeof c||"object"==typeof c&&c)if("[object Function]"==(d=t.call(c)))f=c;else if("[object Array]"==d){l={};for(var h=0,m=c.length,
k;h<m;k=c[h++],(d=t.call(k),"[object String]"==d||"[object Number]"==d)&&(l[k]=1));}if(b)if("[object Number]"==(d=t.call(b))){if(0<(b-=b%1))for(g="",10<b&&(b=10);g.length<b;g+=" ");}else"[object String]"==d&&(g=10>=b.length?b:b.slice(0,10));return L("",(k={},k[""]=a,k),f,l,g,"",[])}}if(!s("json-parse")){var V=B.fromCharCode,W={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"},b,I,k=function(){b=I=null;throw J();},z=function(){for(var a=I,c=a.length,e,g,f,l,d;b<c;)switch(d=a.charCodeAt(b),
d){case 9:case 10:case 13:case 32:b++;break;case 123:case 125:case 91:case 93:case 58:case 44:return e=E?a.charAt(b):a[b],b++,e;case 34:e="@";for(b++;b<c;)if(d=a.charCodeAt(b),32>d)k();else if(92==d)switch(d=a.charCodeAt(++b),d){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:e+=W[d];b++;break;case 117:g=++b;for(f=b+4;b<f;b++)d=a.charCodeAt(b),48<=d&&57>=d||97<=d&&102>=d||65<=d&&70>=d||k();e+=V("0x"+a.slice(g,b));break;default:k()}else{if(34==d)break;d=a.charCodeAt(b);for(g=b;32<=
d&&92!=d&&34!=d;)d=a.charCodeAt(++b);e+=a.slice(g,b)}if(34==a.charCodeAt(b))return b++,e;k();default:g=b;45==d&&(l=!0,d=a.charCodeAt(++b));if(48<=d&&57>=d){for(48==d&&(d=a.charCodeAt(b+1),48<=d&&57>=d)&&k();b<c&&(d=a.charCodeAt(b),48<=d&&57>=d);b++);if(46==a.charCodeAt(b)){for(f=++b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&k();b=f}d=a.charCodeAt(b);if(101==d||69==d){d=a.charCodeAt(++b);43!=d&&45!=d||b++;for(f=b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&k();b=f}return+a.slice(g,b)}l&&
k();if("true"==a.slice(b,b+4))return b+=4,!0;if("false"==a.slice(b,b+5))return b+=5,!1;if("null"==a.slice(b,b+4))return b+=4,null;k()}return"$"},M=function(a){var c,b;"$"==a&&k();if("string"==typeof a){if("@"==(E?a.charAt(0):a[0]))return a.slice(1);if("["==a){for(c=[];;b||(b=!0)){a=z();if("]"==a)break;b&&(","==a?(a=z(),"]"==a&&k()):k());","==a&&k();c.push(M(a))}return c}if("{"==a){for(c={};;b||(b=!0)){a=z();if("}"==a)break;b&&(","==a?(a=z(),"}"==a&&k()):k());","!=a&&"string"==typeof a&&"@"==(E?a.charAt(0):
a[0])&&":"==z()||k();c[a.slice(1)]=M(z())}return c}k()}return a},Q=function(a,b,e){e=P(a,b,e);e===v?delete a[b]:a[b]=e},P=function(a,b,e){var g=a[b],f;if("object"==typeof g&&g)if("[object Array]"==t.call(g))for(f=g.length;f--;)Q(g,f,e);else C(g,function(a){Q(g,a,e)});return e.call(a,b,g)};q.parse=function(a,c){var e,g;b=0;I=""+a;e=M(z());"$"!=z()&&k();b=I=null;return c&&"[object Function]"==t.call(c)?P((g={},g[""]=e,g),"",c):e}}}q.runInContext=K;return q}var J=typeof define==="function"&&define.amd,
A="object"==typeof global&&global;!A||A.global!==A&&A.window!==A||(n=A);if("object"!=typeof exports||!exports||exports.nodeType||J){var N=n.JSON,B=K(n,n.JSON3={noConflict:function(){n.JSON=N;return B}});n.JSON={parse:B.parse,stringify:B.stringify}}else K(n,exports);J&&define(function(){return B})})(this);

function AjaxRequest(url, parameters, callbackSuccess, callbackError, id, dataToKeep) {
  var thisRequestObject;
  if (window.XMLHttpRequest)
    thisRequestObject = new XMLHttpRequest();
  else if (window.ActiveXObject)
    thisRequestObject = new ActiveXObject('Microsoft.XMLHTTP');
  thisRequestObject.requestId = id;
  thisRequestObject.dtk = dataToKeep;
  thisRequestObject.onreadystatechange = ProcessRequest;
  if (typeof (window.izendaPageId$) !== 'undefined') {
  	if (url.indexOf("?") == -1)
  		url = url + "?";
  	else {
  		if (url[url.length - 1] != '&' && url[url.length - 1] != '?')
  			url = url + "&";
  	}
  	url = url + 'izpid=' + window.izendaPageId$;
  }
  thisRequestObject.open('POST', url, true);
  thisRequestObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  thisRequestObject.send(parameters);

  function DeserializeJson() {
    var responseText = thisRequestObject.responseText;
    while (responseText.indexOf('"\\/Date(') >= 0) {
      responseText = responseText.replace('"\\/Date(', 'eval(new Date(');
      responseText = responseText.replace(')\\/"', '))');
    }
    if (responseText.charAt(0) != '[' && responseText.charAt(0) != '{')
      responseText = '{' + responseText + '}';
    var isArray = true;
    if (responseText.charAt(0) != '[') {
      responseText = '[' + responseText + ']';
      isArray = false;
    }
    var retObj = eval(responseText);
    if (!isArray)
      return retObj[0];
    return retObj;
  }

  function ProcessRequest() {
    if (thisRequestObject.readyState == 4) {
      if (thisRequestObject.status == 200 && callbackSuccess) {
        var toRet;
        if (thisRequestObject.requestId != 'getrenderedreportset' && thisRequestObject.requestId != 'getcrsreportpartpreview' && thisRequestObject.requestId != 'renderedreportpart')
          toRet = DeserializeJson();
        else
          toRet = thisRequestObject.responseText;      
        callbackSuccess(toRet, thisRequestObject.requestId, thisRequestObject.dtk);
      }
      else if (callbackError) {
        callbackError(thisRequestObject);
      }
    }
  }
}

//Exchange data with server methods-------------------------------------------------------------------------
//lazy loading---------------------------------------------------------------------------------------------------
function RequestBranch(parentNode) {
  SetWaitingCursor();
  if (parentNode == null) {
    ftw.get_nodes().clear();
    GetSchemaBranch('');
  }
  else
    GetSchemaBranch(parentNode.get_value());
}

function AcceptBranch(branchData) {
  var parent = FindParent(branchData.ParentId);
  if (parent == null)
    return;
  var newNode;
  var stubNode;
  ftw.beginUpdate();
  var nodes = parent.get_nodes();
  nodes.clear();
  for (var index = 0; index < branchData.Branch.length; index++) {
    newNode = new ComponentArt.Web.UI.TreeViewNode();
    newNode.set_text(branchData.Branch[index].Na);
    newNode.set_value(branchData.Branch[index].Id);
    newNode.set_expanded(false);
    newNode.Data.NType = branchData.Branch[index].Ty;
    if (branchData.Branch[index].Ty == 'fi') {
      newNode.set_showCheckBox(true);
      newNode.set_checked(branchData.Branch[index].Vi);
    }
    else
      newNode.set_showCheckBox(false);
    newNode.set_imageUrl(branchData.Branch[index].In);
    nodes.add(newNode);
    if (branchData.Branch[index].Hc == '1') {
      stubNode = new ComponentArt.Web.UI.TreeViewNode();
      stubNode.set_text('Loading...');
      stubNode.set_value('###MUSTBELOADED###');
      stubNode.set_expanded(false);
      stubNode.set_showCheckBox(false);
      newNode.get_nodes().add(stubNode);
    }
  }
  ftw.endUpdate();
  SetDefaultCursor();
  SetStatus('');
  if (parent.Data.NType == 'sp' && branchData.Branch.length == 0)
    alert(parent.Text + ' does not return metadata when passing in NULL values for parameters.  Since stored procedures do not have a model, they must return a zero row result set that contains all their columns when NULL parameters are passed in. Please update this stored procedure so it returns it`s metadata.');
}

function GetSchemaBranch(parentId) {
  var requestString = 'wscmd=schemabranch';
  if (parentId != null && parentId != '')
    requestString += '&wsarg0=' + parentId;
  AjaxRequest('./rs.aspx', requestString, ReceiveSchemaBranch, null, 'schemabranch');
}

function ReceiveSchemaBranch(returnObj, id) {
  if (id != 'schemabranch' || returnObj == undefined || returnObj == null)
    return;
  if (returnObj.Branch != null)
    AcceptBranch(returnObj);
  else {
    SetDefaultCursor();
    if (returnObj.Value != 'OK')
      SetStatus('ERROR: ' + returnObj.Value);
    else
      SetStatus('');
  }
}

//status----------------------------------------------------------------------------------------------------------
function GetStatus() {
  SetWaitingCursor();
  var requestString = 'wscmd=getstatus';
  AjaxRequest('./rs.aspx', requestString, StatusGot, null, 'getstatus');
}

function StatusGot(returnObj, id) {
  if (id != 'getstatus' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    if (returnObj.AdditionalData != undefined && returnObj.AdditionalData.length == 5) {
      var logoField = document.getElementById('logo');
      if (returnObj.AdditionalData[0] == null)
        returnObj.AdditionalData[0] = '';
      logoField.value = returnObj.AdditionalData[0];
      if (returnObj.AdditionalData[1] != '') {
        var keyField = document.getElementById('licenseKey');
        keyField.value = returnObj.AdditionalData[1];
        var cBtn = document.getElementById('setKey');
        cBtn.style.color = '#000000';
        $("#tabs").tabs('enable', 1);
        if (returnObj.AdditionalData[2] == '1') {
          $("#tabs").tabs('enable', 2);
          $("#tabs").tabs('select', 2);
          if (returnObj.AdditionalData[3] == '1') {
            $("#tabs").tabs('enable', 3);
            $("#tabs").tabs('enable', 4);
            $("#tabs").tabs('enable', 5);
            $("#tabs").tabs('enable', 6);
            $("#tabs").tabs('enable', 7);
          }
        }
        var securityKey = document.getElementById('securityKey');
        securityKey.value = returnObj.AdditionalData[4];
      }
      RefreshExistingConnections();
      GetAdvanced();
      GetBranding();
      GetUsersRoles();
    }
  }
}

//license key----------------------------------------------------------------------------------------------------
function SendLicenseKey(key, logo) {
  SetWaitingCursor();
  var requestString = 'wscmd=setlicensekey&wsarg0=' + encodeURIComponent(key) + '&wsarg1=' + encodeURIComponent(logo);
  AjaxRequest('./rs.aspx', requestString, KeyAccepted, null, 'setlicensekey');
}

function KeyAccepted(returnObj, id) {
  if (id != 'setlicensekey' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('');
    IntermediateSave();
    $("#tabs").tabs('enable', 1);
    if (!initializingRoutines && needActivate)
      $('#tabs').tabs('select', 1);
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function CheckLicenseKey(key) {
  SetWaitingCursor();
  var requestString = 'wscmd=checklicensekey&wsarg0=' + encodeURIComponent(key);
  AjaxRequest('./rs.aspx', requestString, KeyChecked, null, 'checklicensekey');
}

function KeyChecked(returnObj, id) {
  if (id != 'checklicensekey' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  var cBtn = document.getElementById('setKey');
  var kss = document.getElementById('keySymbol');
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('Key is valid');
    cBtn.style.color = '#000000';
    kss.innerHTML = '√';
  }
  else {
    if (returnObj.Value == 'This key is expired and some limitations will apply') {
      SetStatus('WARNING: ' + returnObj.Value);
      cBtn.style.color = '#000000';
      kss.innerHTML = '√ (With limitations)';
    }
    else {
      SetStatus('ERROR: ' + returnObj.Value);
      cBtn.style.color = '#b0b0b0';
      kss.innerHTML = 'X';
    }
  }
}

//connections----------------------------------------------------------------------------------------------------
function CreateConnection(cs, csType, alias) {
  SetWaitingCursor();
  var requestString = 'wscmd=addconnection&wsarg0=' + encodeURIComponent(cs) + '&wsarg1=' + alias + '&wsarg2=' + csType;
  AjaxRequest('./rs.aspx', requestString, ConnectionAdded, null, 'addconnection');
}

function ConnectionAdded(returnObj, id) {
  if (id != 'addconnection' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    $("#tabs").tabs('enable', 2);
    document.getElementById('newCs').value = '';
    document.getElementById('newAlias').value = '';
    IntermediateSave();
    RefreshExistingConnections();
  }
  else {
    SetDefaultCursor();
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

function UpdateConnectionStrings() {
  SetWaitingCursor();
  var connInd = 0;
  var argInd = 0;
  var connData = '';
  while (true) {
    var cct = document.getElementById('ct' + connInd);
    var cca = document.getElementById('ca' + connInd);
    var ccs = document.getElementById('cs' + connInd);
    if (cct == null || cca == null || ccs == null)
      break;
    connData += '&wsarg' + argInd + '=' + encodeURIComponent(ccs.value);
    argInd++;
    connData += '&wsarg' + argInd + '=' + cca.value;
    argInd++;
    connData += '&wsarg' + argInd + '=' + cct.value;
    argInd++;
    connInd++;
  }
  var requestString = 'wscmd=updateconnections' + connData;
  AjaxRequest('./rs.aspx', requestString, ConnectionsUpdated, null, 'updateconnections');
}

function ConnectionsUpdated(returnObj, id) {
  if (id != 'updateconnections' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    IntermediateSave();
    RefreshExistingConnections();
  }
  else {
    SetDefaultCursor();
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

function RefreshExistingConnections() {
  var requestString = 'wscmd=refreshexistingconnections';
  AjaxRequest('./rs.aspx', requestString, ExistingConnectionsGot, null, 'refreshexistingconnections');
}

function ExistingConnectionsGot(returnObj, id) {
  if (id != 'refreshexistingconnections' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    var connDiv = document.getElementById('existingConnections');
    if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0) {
      var cc = '<table><tr><td>Server Type</td><td>Alias</td><td>Connection string</td></tr>';
      var connNum = returnObj.AdditionalData.length / 3;
      var lineCnt = 0;
      for (var connCnt = 0; connCnt < connNum; connCnt++) {
        cc += '<tr><td><select id="ct' + connCnt + '" style="width:150px;height:26px;">';
        cc += '<option value="mssql" ' + (returnObj.AdditionalData[lineCnt] == 'mssql' ? 'select' : '') + '>Microsoft SQL Server</option>';
        cc += '<option value="oracle" ' + (returnObj.AdditionalData[lineCnt] == 'oracle' ? 'select' : '') + '>Oracle</option>';
        cc += '<option value="mysql" ' + (returnObj.AdditionalData[lineCnt] == 'mysql' ? 'select' : '') + '>MySQL</option>';
        cc += '<option value="db2" ' + (returnObj.AdditionalData[lineCnt] == 'db2' ? 'select' : '') + '>IBM DB2</option>';
        cc += '<option value="odata" ' + (returnObj.AdditionalData[lineCnt] == 'odata' ? 'select' : '') + '>OData</option>';
        cc += '</select></td>';
        lineCnt++;
        cc += '<td><input type="text" id="ca' + connCnt + '" style="width:150px" value="' + returnObj.AdditionalData[lineCnt] + '" /></td>';
        lineCnt++;
        cc += '<td><input type="text" id="cs' + connCnt + '" style="width:408px" value="' + returnObj.AdditionalData[lineCnt] + '" /></td></tr>';
        lineCnt++;
      }
      cc += '<tr><td colspan="3"><input type="button" id="updateCs" style="background-color:LightGray;border:1px solid DarkGray;" onclick="UpdateConnectionStrings();" value="Update connections strings data" /></td></tr>';
      cc += '</table><br /><br />';
      connDiv.innerHTML = cc;
      var aliasRow = document.getElementById('aliasRow');
      if (aliasRow.style.display == 'none') {
        var aliasRow = document.getElementById('aliasRow');
        var addNewCs = document.getElementById('addNewCs');
        aliasRow.style.display = '';
        addNewCs.style.display = '';
        if (!initializingRoutines && needActivate)
          $('#tabs').tabs('select', 2);
      }
      GetFullDsList();
    }
    else
      connDiv.innerHTML = '';
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

//datasources-----------------------------------------------------------------------------------------------------
function GetFullDsList() {
  var requestString = 'wscmd=fulldslist';
  AjaxRequest('./rs.aspx', requestString, GotFullDsList, null, 'fulldslist');
}

function GotFullDsList(returnObj, id) {
  if (id != 'fulldslist' || returnObj == undefined || returnObj == null)
    return;
  if (returnObj.FullData != null) {
    RenderFullDsList(returnObj.FullData);
    RequestBranch(null);
  }
  else {
    SetDefaultCursor();
    if (returnObj.Value != 'OK')
      SetStatus('ERROR: ' + returnObj.Value);
    else
      SetStatus('');
  }
}

function UpdateFullList() {
  initializingRoutines = false;
  SetWaitingCursor();
  var checked_ids = new Array();
  var unchecked_ids = new Array();
  $("#demo3").jstree("get_checked", null, true).each(function() { checked_ids.push(this.id); });
  $("#demo3").jstree("get_unchecked", null, true).each(function() { unchecked_ids.push(this.id); });
  var visibilityData = new Object();
  visibilityData.DataSources = new Array();
  for (var i = 0; i < checked_ids.length; i++) {
    if (checked_ids[i] == '')
      continue;
    var ds = new Object();
    ds.Id = checked_ids[i];
    ds.Vi = 1;
    visibilityData.DataSources[visibilityData.DataSources.length] = ds;
  }
  for (var i = 0; i < unchecked_ids.length; i++) {
    if (unchecked_ids[i] == '')
      continue;
    var ds = new Object();
    ds.Id = unchecked_ids[i];
    ds.Vi = 0;
    visibilityData.DataSources[visibilityData.DataSources.length] = ds;
  }
  var s = JSON.stringify(visibilityData);
  SendFullList(s);
}

function SendFullList(data) {
  var requestString = 'wscmd=updatefulllist&wsarg0=' + data;
  AjaxRequest('./rs.aspx', requestString, FullListSent, null, 'updatefulllist');
}

function FullListSent(returnObj, id) {
  if (id != 'updatefulllist' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('');
    IntermediateSave();
    $("#tabs").tabs('enable', 3);
    $("#tabs").tabs('enable', 4);
    $("#tabs").tabs('enable', 5);
    $("#tabs").tabs('enable', 6);
    $("#tabs").tabs('enable', 7);
    if (!initializingRoutines && needActivate)
      $('#tabs').tabs('select', 3);
    RequestBranch(null);
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function RenderFullDsList(list) {
  var jsd = '{"data": [';
  for (var dbCnt = 0; dbCnt < list.length; dbCnt++) {
    jsd += '{"data":{"title":"' + list[dbCnt].Na + '"}, "attr":{"id" : "rootnode' + dbCnt + '"}, "state":"open", "icon":"./rs.aspx?image=DataSources.db.gif", "children" :[';
    var tables = '';
    var views = '';
    var sps = '';
    for (var dsCnt = 0; dsCnt < list[dbCnt].Ds.length; dsCnt++) {
      var vi = ', "class":"jstree-no-icons"';
      if (list[dbCnt].Ds[dsCnt].Vi)
        vi = ', "class":"jstree-checked jstree-no-icons"';
      var nodeLine = '{"data":{"title":"' + list[dbCnt].Ds[dsCnt].Na + '"}, "icon":"", "attr":{"id" : "' + list[dbCnt].Ds[dsCnt].Id + '"' + vi + '}}';
      if (list[dbCnt].Ds[dsCnt].Ty == 'ds') {
        if (tables != '')
          tables += ',';
        tables += nodeLine;
      }
      else if (list[dbCnt].Ds[dsCnt].Ty == 'vw') {
        if (views != '')
          views += ',';
        views += nodeLine;
      }
      else if (list[dbCnt].Ds[dsCnt].Ty == 'sp') {
        if (sps != '')
          sps += ',';
        sps += nodeLine;
      }
    }
    jsd += '{"data":{"title":"Tables"}, "attr":{"id" : "tablenode' + dbCnt + '"}, "icon":"./rs.aspx?image=DataSources.ds.gif", "children" :[' + tables + ']},';
    jsd += '{"data":{"title":"Views"}, "attr":{"id" : "viewnode' + dbCnt + '"}, "icon":"./rs.aspx?image=DataSources.ds.gif", "children" :[' + views + ']},';
    jsd += '{"data":{"title":"Stored procedures"}, "attr":{"id" : "spsnode' + dbCnt + '"}, "icon":"./rs.aspx?image=DataSources.sp.gif", "children" :[' + sps + ']}]}';
    if (dbCnt < list.length - 1)
      jsd += ',';
  }
  jsd += ']}';
  var myObject = JSON.parse(jsd);
  $("#demo3")
      .jstree({ "json_data": myObject, "plugins": ["checkbox", "themes", "ui", "json_data"], checkbox: { "two_state": true} })
      .bind("loaded.jstree", function(event, data) {
        for (var dbCnt = 0; dbCnt < list.length; dbCnt++) {
          $('#rootnode' + dbCnt).find('ins.jstree-checkbox')[0].style.display = 'none';
          $('#tablenode' + dbCnt).find('ins.jstree-checkbox')[0].style.display = 'none';
          $('#viewnode' + dbCnt).find('ins.jstree-checkbox')[0].style.display = 'none';
          $('#spsnode' + dbCnt).find('ins.jstree-checkbox')[0].style.display = 'none';
        }
      });
  //.bind("select_node.jstree", function(event, data) { alert(data.rslt.obj.attr("id")); })
  //.delegate("a", "click", function(event, data) { event.preventDefault(); });
}

//fields------------------------------------------------------------------------------------------------------------
function UpdateVisibilitySettings() {
  initializingRoutines = false;
  SetWaitingCursor();
  var visibilityData = new Object();
  visibilityData.Fields = new Array();
  var connections = ftw.get_nodes();
  var cLen = connections.get_length();
  if (cLen == 0)
    return;
  for (var cCnt = 0; cCnt < cLen; cCnt++) {
    var cNode = connections.getNode(cCnt);
    var datasources = cNode.get_nodes();
    var dLen = datasources.get_length();
    if (dLen == 0)
      continue;
    for (dCnt = 0; dCnt < dLen; dCnt++) {
      var dNode = datasources.getNode(dCnt);
      var fields = dNode.get_nodes();
      var fLen = fields.get_length();
      if (fLen == 0)
        continue;
      for (var fCnt = 0; fCnt < fLen; fCnt++) {
        var fNode = fields.getNode(fCnt);
        var field = new Object();
        field.Id = fNode.get_value();
        if (fNode.get_checked())
          field.Vi = 1;
        else
          field.Vi = 0;
        if (field.Id != '###MUSTBELOADED###')
          visibilityData.Fields[visibilityData.Fields.length] = field;
      }
    }
  }
  var s = JSON.stringify(visibilityData);
  SendVisibilityData(s);
}

function SendVisibilityData(data) {
  var requestString = 'wscmd=updatefields&wsarg0=' + data;
  AjaxRequest('./rs.aspx', requestString, SchemaUpdateResult, null, 'updatefields');
}

function SchemaUpdateResult(returnObj, id) {
  if (id != 'updatefields' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('');
    IntermediateSave();
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function GetDataSourceCfg(dsName) {
  var requestString = 'wscmd=getdscfg&wsarg0=' + encodeURIComponent(dsName);
  AjaxRequest('./rs.aspx', requestString, GotDataSourceCfg, null, 'getdscfg');
}

function GotDataSourceCfg(returnObj, id) {
  if (id != 'getdscfg' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    var alias = document.getElementById('alias');
    if (returnObj.AdditionalData.length > 0)
      alias.value = returnObj.AdditionalData[0];
    var category = document.getElementById('category');
    if (returnObj.AdditionalData.length > 1)
      category.value = returnObj.AdditionalData[1];    
  }
  else {
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

function SetDataSourceCfg(dsName, alias, category) {
  var requestString = 'wscmd=setdscfg&wsarg0=' + encodeURIComponent(dsName) + '&wsarg1=' + encodeURIComponent(alias) + '&wsarg2=' + encodeURIComponent(category);
  AjaxRequest('./rs.aspx', requestString, DataSourceCfgSet, null, 'setdscfg');
}

function DataSourceCfgSet(returnObj, id) {
  if (id != 'setdscfg' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    IntermediateSave();
  }
  else {
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

function GetFieldCfg(fiName) {
  var requestString = 'wscmd=getficfg&wsarg0=' + encodeURIComponent(fiName);
  AjaxRequest('./rs.aspx', requestString, GotFieldCfg, null, 'getficfg');
}

function GotFieldCfg(returnObj, id) {
  if (id != 'getficfg' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    var alias = document.getElementById('alias');
    var foreignCol = document.getElementById('foreignColumn');
    if (returnObj.AdditionalData.length == 2) {
      alias.value = returnObj.AdditionalData[0];
      foreignCol.value = returnObj.AdditionalData[1];
    }
    else
      SetStatus('ERROR: Unexpected number of values');
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function SetFieldCfg(fiName, alias, foreignName) {
  var requestString = 'wscmd=setficfg&wsarg0=' + encodeURIComponent(fiName) + '&wsarg1=' + encodeURIComponent(alias) + '&wsarg2=' + encodeURIComponent(foreignName);
  AjaxRequest('./rs.aspx', requestString, FieldCfgSet, null, 'setficfg');
}

function FieldCfgSet(returnObj, id) {
  if (id != 'setficfg' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    IntermediateSave();
  }
  else {
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

//advanced--------------------------------------------------------------------------------------------------------------
function GetAdvanced() {
  SetWaitingCursor();
  var requestString = 'wscmd=loadadvanced';
  AjaxRequest('./rs.aspx', requestString, AdvancedGot, null, 'loadadvanced');
}

function AdvancedGot(returnObj, id) {
  if (id != 'loadadvanced' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    if (returnObj.AdditionalData != null) {
      SetStatus('');
      var settingsDiv = document.getElementById('existingSettings');
      var settingsCode = '';
      var lineCnt = 0;
      var settingsCnt = 0;
      if (returnObj.AdditionalData.length > 0)
        settingsCode += 'Modified settings:<br /><br />';
      while (lineCnt < returnObj.AdditionalData.length) {
        var name = returnObj.AdditionalData[lineCnt];
        lineCnt++;
        var type = returnObj.AdditionalData[lineCnt];
        lineCnt++;
        var value = returnObj.AdditionalData[lineCnt];
        lineCnt++;
        settingsCode += '<input type="text" style="width: 380px;" id="esName' + settingsCnt + '" value="' + name + '" />&nbsp;';
        if (type == 'bool')
          settingsCode += '<input type="checkbox" id="esBoolVal' + settingsCnt + '"' + (value == 'True' ? ' CHECKED="yes"' : '') + ' />';
        if (type == 'string')
          settingsCode += '<input type="text" style="width:340px;" id="esStringVal' + settingsCnt + '" value="' + value + '" />';
        if (type == 'enum') {
          settingsCode += '<select id="esSelectVal' + settingsCnt + '" style="width:346px;height:26px;">';
          var valuesNum = parseInt(returnObj.AdditionalData[lineCnt]);
          lineCnt++;
          var valuesCnt = 0;
          while (valuesCnt < valuesNum) {
            var newValue = returnObj.AdditionalData[lineCnt];
            lineCnt++;
            settingsCode += '<option value="' + newValue + '"' + (newValue == value ? ' selected' : '') + '>' + newValue + '</option>';
            valuesCnt++;
          }
          settingsCode += '</select>';
        }
        settingsCode += '<br /><br />';
        settingsCnt++;
      }
      settingsDiv.innerHTML = settingsCode;
    }
    else
      SetStatus('ERROR: No settings data returned');
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function SaveAdvanced() {
  initializingRoutines = false;
  SetWaitingCursor();
  var key = document.getElementById('securityKey').value;
  var requestString = 'wscmd=saveadvanced&wsarg0=' + encodeURIComponent(key);
  var argCnt = 1;
  var settingCnt = 0;
  var settingFound = true;
  while (settingFound) {
    var name = null;
    var type = null;
    var value = null;
    var nameValue = document.getElementById('esName' + settingCnt);
    if (nameValue != null)
      name = nameValue.value;
    var boolValue = document.getElementById('esBoolVal' + settingCnt);
    if (boolValue != null) {
      type = 'bool';
      value = boolValue.checked;
    }
    var stringValue = document.getElementById('esStringVal' + settingCnt);
    if (stringValue != null) {
      type = 'string';
      value = stringValue.value;
    }
    var selectValue = document.getElementById('esSelectVal' + settingCnt);
    if (selectValue != null) {
      type = 'enum';
      value = selectValue.value;
    }
    if (name != null && name != '' && type != null && value != null) {
      requestString += '&wsarg' + argCnt + '=' + name;
      argCnt++;
      requestString += '&wsarg' + argCnt + '=' + type;
      argCnt++;
      requestString += '&wsarg' + argCnt + '=' + encodeURIComponent(value);
      argCnt++;
      settingCnt++;
    }
    else
      settingFound = false;
  }
  AjaxRequest('./rs.aspx', requestString, AdvancedSaved, null, 'saveadvanced');
}

function AdvancedSaved(returnObj, id) {
  if (id != 'saveadvanced' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('');
    if (!initializingRoutines && needActivate)
      $('#tabs').tabs('select', 7);
    IntermediateSave();
    GetAdvanced();
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function GetSetting(settingName) {
  var requestString = 'wscmd=getsetting&wsarg0=' + settingName;
  AjaxRequest('./rs.aspx', requestString, SettingGot, null, 'getsetting');
}

function SettingGot(returnObj, id) {
  if (id != 'getsetting' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    FillProperty(returnObj.AdditionalData);
    SetStatus('');
  }
  else {
    FillProperty(null);
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

function SetSetting(settingName, settingType, settingValue) {
  var requestString = 'wscmd=setsetting&wsarg0=' + settingName + '&wsarg1=' + settingType + '&wsarg2=' + encodeURIComponent(settingValue);
  AjaxRequest('./rs.aspx', requestString, SettingSet, null, 'setsetting');
}

function SettingSet(returnObj, id) {
  if (id != 'setsetting' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    FillProperty(null);
    document.getElementById('settingName').value = '';
    GetAdvanced();
  }
  else {
    SetStatus('ERROR: ' + returnObj.Value);
  }
}

//save-------------------------------------------------------------------------------------------------------
function SaveSettings() {
  SetWaitingCursor();
  var requestString = 'wscmd=savesettings';
  AjaxRequest('./rs.aspx', requestString, SettingsSaved, null, 'savesettings');
}

function SettingsSaved(returnObj, id) {
  if (id != 'savesettings' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  SetDefaultCursor();
  if (returnObj.Value == 'OK') {
    SetStatus('');
    //window.location = 'ReportDesigner.aspx';
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

//auxiliary-----------------------------------------------------------------------------------------------------
function IntermediateSave() {
  var requestString = 'wscmd=intermediatesavesettings';
  AjaxRequest('./rs.aspx', requestString, IntermediateSaved, null, 'intermediatesavesettings');
}

function IntermediateSaved() {
}

function GetMatchingFields(namePart, responseFunction) {
  var requestString = 'wscmd=matchingfields&wsarg0=' + encodeURIComponent(namePart);
  AjaxRequest('./rs.aspx', requestString, MatchingFieldsResponse, null, 'matchingfields', responseFunction);
}

function MatchingFieldsResponse(returnObj, id, responseFunction) {
  if (id != 'matchingfields' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    var cnt = returnObj.AdditionalData.length;
    var result = new Array();
    for (var i = 0; i < cnt; i++)
      result.push(returnObj.AdditionalData[i]);
    responseFunction(result);
  }
  else
    SetStatus('ERROR: ' + returnObj.Value);
}

function GetMatchingSettings(namePart, responseFunction) {
  var requestString = 'wscmd=matchingsettings&wsarg0=' + encodeURIComponent(namePart);
  AjaxRequest('./rs.aspx', requestString, MatchingSettingsResponse, null, 'matchingsettings', responseFunction);
}

function MatchingSettingsResponse(returnObj, id, responseFunction) {
  if (id != 'matchingsettings' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    var cnt = returnObj.AdditionalData.length;
    var result = new Array();
    //uncomment to return autocomplete for settings
    /*for (var i = 0; i < cnt; i++)
    result.push(returnObj.AdditionalData[i]);*/
    if (returnObj.AdditionalData.length == 1) {
      document.getElementById('settingName').value = returnObj.AdditionalData[0];
      GetSetting(document.getElementById('settingName').value);
    }
    else
      FillProperty(null);
    responseFunction(result);
  }
  else {
    SetStatus('ERROR: ' + returnObj.Value);
    FillProperty(null);
    if (returnObj.Value == 'No values')
      responseFunction(new Array());
  }
}

//GUI events methods-------------------------------------------------------------------------------------
function TabClicked() {
  var currentNum = $("#tabs").tabs('option', 'selected');
  needActivate = false;
  if (currentNum == 0)
    SetLicenseKey();
  else if (currentNum == 1)
    ContinueToDatasources();
  else if (currentNum == 2) {
    var aliasDiv = document.getElementById('aliasDiv');
    var categoryDiv = document.getElementById('categoryDiv');
    var foreignColDiv = document.getElementById('foreignColDiv');
    var addConstraint = document.getElementById('addConstraint');
    aliasDiv.style.display = 'none';
    categoryDiv.style.display = 'none';
    foreignColDiv.style.display = 'none';
    addConstraint.style.display = 'none';
    UpdateFullList();
  }
  else if (currentNum == 3)
    GoToUsersRoles();
  else if (currentNum == 4)
    GoToBranding();
  else if (currentNum == 5)
    GoToAdvanced();
  else if (currentNum == 6)
    SaveAdvanced();  
}

//initialization-------------------------------------------------------------------------------------------------
function Initialize() {
  InitializeTreeView();
  GetStatus();
}

function InitializeTreeView() {
  ftw.beginUpdate();
  ftw.set_nodeCssClass('TreeNode');
  ftw.set_selectedNodeCssClass('SelectedTreeNode');
  ftw.set_hoverNodeCssClass('HoverTreeNode');
  ftw.set_nodeEditCssClass('NodeEdit');
  ftw.set_lineImageWidth(19);
  ftw.set_lineImageHeight(20);
  ftw.set_defaultImageWidth(16);
  ftw.set_defaultImageHeight(16);
  ftw.set_itemSpacing(0);
  ftw.set_nodeLabelPadding(3);
  ftw.endUpdate();
}

//key------------------------------------------------------------------------------------------------------------
function SetLicenseKey() {
  initializingRoutines = false;
  var key = document.getElementById('licenseKey').value;
  var logo = document.getElementById('logo').value;
  SendLicenseKey(key, logo);
}

function ValidateLicenseKey() {
  var key = document.getElementById('licenseKey').value;
  CheckLicenseKey(key);
}

//connetions------------------------------------------------------------------------------------------------------------
function AddNewConnectionString() {
  initializingRoutines = false;
  var cs = document.getElementById('newCs').value;
  var alias = document.getElementById('newAlias').value;
  var csType = document.getElementById('csType').value;
  CreateConnection(cs, csType, alias);
}

function ContinueToDatasources() {
  initializingRoutines = false;
  var aliasRow = document.getElementById('aliasRow');
  if (aliasRow.style.display == 'none')
    AddNewConnectionString();
  else {
    if (!initializingRoutines && needActivate)
      $('#tabs').tabs('select', 2);
  }
}

function QS_SelectConnectionShowDialog() {
  var md = document.getElementById('modalDiv');
  md.left = 0;
  md.top = 0;
  md.style.display = '';
  initializingRoutines = false;
  document.getElementById('cswServerNameRow').display = '';
  document.getElementById('cswDatabaseRow').display = '';
  document.getElementById('cswAuthTypeRow').display = '';
  document.getElementById('cswLoginRow').display = '';
  document.getElementById('cswPasswordRow').display = '';
  var wizard = jQ('#cswConnectionWizardContainer');
  wizard.css("position", "absolute");
  wizard.css("top", ((jQ(window).height() - wizard.outerHeight()) / 2) + jQ(window).scrollTop() + "px");
  wizard.css("left", ((jQ(window).width() - wizard.outerWidth()) / 2) + jQ(window).scrollLeft() + "px");
  wizard.show();
}

function QS_WizardOk() {
  var md = document.getElementById('modalDiv');
  md.style.display = 'none';  
  var serverType = document.getElementById('cswServerType').value;
  var authType = document.getElementById('cswAuthType').value;
  var serverName = document.getElementById('cswServerName').value;
  var databaseName = document.getElementById('cswDatabase').value;
  var login = document.getElementById('cswLogin').value;
  var password = document.getElementById('cswPassword').value;
  var additional = document.getElementById('cswAdditionalSettings').value;
  var connectionString = QS_GenerateConnectionString(serverType, authType, serverName, databaseName, login, password, additional);
  document.getElementById('newCs').value = connectionString;
  document.getElementById('cswConnectionWizardContainer').style.display = 'none';
}

function QS_WizardCancel() {
  var md = document.getElementById('modalDiv');
  md.style.display = 'none';    
  document.getElementById('cswConnectionWizardContainer').style.display = 'none';
}

//fields------------------------------------------------------------------------------------------------------------
function GoToUsersRoles() {
  initializingRoutines = false;
  UpdateVisibilitySettings();
  if (needActivate)
    $('#tabs').tabs('select', 4);
}

function ftw_onNodeExpand(sender, eventArgs) {
  var parent = eventArgs.get_node();
  var children = parent.get_nodes();
  if (children.get_length() == 1) {
    var cValue = children.getNode(0).get_value();
    if (cValue == '###MUSTBELOADED###') {
      RequestBranch(parent);
      return;
    }
  }
  SetStatus('');
}

function ftw_onNodeSelect(sender, eventArgs) {
  var aliasDiv = document.getElementById('aliasDiv');
  var categoryDiv = document.getElementById('categoryDiv');
  var foreignColDiv = document.getElementById('foreignColDiv');
  var addConstraint = document.getElementById('addConstraint');
  var currentNType = document.getElementById('currentNType');
  aliasDiv.style.display = 'none';
  categoryDiv.style.display = 'none';  
  foreignColDiv.style.display = 'none';
  addConstraint.style.display = 'none';
  var node = eventArgs.get_node();
  var value = node.get_value();
  document.getElementById('primaryColumn').value = value;
  var nType = node.Data.NType;
  currentNType.value = nType;
  if (nType == 'ds' || nType == 'sp' || nType == 'vw') {
    aliasDiv.style.display = '';
    categoryDiv.style.display = '';    
    addConstraint.style.display = '';
    GetDataSourceCfg(value);
  }
  if (nType == 'fi') {
    aliasDiv.style.display = '';
    var isSp = false;
    var parentNode = node.ParentNode;
    if (parentNode != null && parentNode.Data.NType == 'sp')
      isSp = true;
    if (!isSp)
      foreignColDiv.style.display = '';
    addConstraint.style.display = '';
    GetFieldCfg(value);
  }
}

function SaveCfg() {
  initializingRoutines = false;
  var currentNType = document.getElementById('currentNType');
  if (currentNType.value == 'ds' || currentNType.value == 'sp' || currentNType.value == 'vw')
    SetDataSourceCfg(document.getElementById('primaryColumn').value, document.getElementById('alias').value, document.getElementById('category').value);
  if (currentNType.value == 'fi')
    SetFieldCfg(document.getElementById('primaryColumn').value, document.getElementById('alias').value, document.getElementById('foreignColumn').value);
}

//users and roles------------------------------------------------------------------------------------------------------
function GoToBranding() {
  initializingRoutines = false;
  SetUsersRoles();
  if (needActivate)
    $('#tabs').tabs('select', 5);
}

function GetUsersRoles() {
  var requestString = 'wscmd=getusersroles';
  AjaxRequest('./rs.aspx', requestString, UsersRolesGot, null, 'getusersroles');
}

function UsersRolesGot(returnObj, id) {
  if (id != 'getusersroles' || returnObj == undefined || returnObj == null)
    return;
  SetStatus('');
  var urDataDiv = document.getElementById('urDataDiv');
  urDataDiv.innerHTML = '';
  if (returnObj.UsersData == null || returnObj.UsersData.length <= 0)
    return;
  var dh = '<table>';
  for (var i = 0; i < returnObj.UsersData.length; i++) {
    dh += '<tr>';
    dh += '<td>User name:</td>';
    dh += '<td><input type="text" value="' + returnObj.UsersData[i].Name + '" /></td>';
    dh += '</tr>';
    dh += '<tr>';
    dh += '<td>Password:</td>';
    dh += '<td><input type="text" value="' + returnObj.UsersData[i].Password + '" /></td>';
    dh += '</tr>';
    dh += '<tr>';
    dh += '<td>Hidden filter field:</td>';
    dh += '<td><input type="text" value="' + returnObj.UsersData[i].HiddenFilter + '" /></td>';
    dh += '</tr>';
    dh += '<tr>';
    dh += '<td>Hidden filter values:</td>';
    dh += '<td><input type="text" value="' + returnObj.UsersData[i].HiddenFilterValues + '" /></td>';
    dh += '</tr>';
    if (i < returnObj.UsersData.length - 1)
      dh += '<tr><td colspan="4" style="border-top:1px #000000 solid;">&nbsp;</td></tr>';
  }
  dh += '</table>';
  urDataDiv.innerHTML = dh;
}

function SetUsersRoles() {
  var requestString = 'wscmd=setusersroles&wsarg0=' + encodeURIComponent(document.getElementById('headerImageUrl').value);
  AjaxRequest('./rs.aspx', requestString, UsersRolesSet, null, 'setusersroles');
}

function UsersRolesSet(returnObj, id) {
  if (id != 'setusersroles' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
  }
}

//branding------------------------------------------------------------------------------------------------------
function GoToAdvanced() {
  initializingRoutines = false;
  SetBranding();
  if (needActivate)
    $('#tabs').tabs('select', 6);
}

function GetBranding() {
  var requestString = 'wscmd=getbranding';
  AjaxRequest('./rs.aspx', requestString, BrandingGot, null, 'getbranding');
}

function BrandingGot(returnObj, id) {
  if (id != 'getbranding' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
    if (returnObj.AdditionalData != null && returnObj.AdditionalData.length > 0)
      document.getElementById('headerImageUrl').value = returnObj.AdditionalData[0];
  }
}

function SetBranding() {
  var requestString = 'wscmd=setbranding&wsarg0=' + encodeURIComponent(document.getElementById('headerImageUrl').value);
  AjaxRequest('./rs.aspx', requestString, BrandingSet, null, 'setbranding');
}

function BrandingSet(returnObj, id) {
  if (id != 'setbranding' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value == 'OK') {
    SetStatus('');
  }
}

//advanced------------------------------------------------------------------------------------------------------------
function SettingNameChange(val) {
  initializingRoutines = false;
  if (val == '') {
    var snImg = document.getElementById('settingNameImg');
    snImg.style.display = 'none';
  }
}

function ApplySetting() {
  initializingRoutines = false;
  var settingName = document.getElementById('settingName');
  var sn = settingName.value;
  var checkBox = document.getElementById('checkBoxVal');
  var editBox = document.getElementById('editBoxVal');
  var selectBox = document.getElementById('selectBoxVal');
  var value = '';
  var st = '';
  if (checkBox.style.display != 'none') {
    st = 'bool';
    value = checkBox.checked;
  }
  if (editBox.style.display != 'none') {
    st = 'string';
    value = editBox.value;
  }
  if (selectBox.style.display != 'none') {
    st = 'enum';
    value = selectBox.value;
  }
  SetSetting(sn, st, value);
}

//save------------------------------------------------------------------------------------------------------------
function SaveCurrentSettings() {
  initializingRoutines = false;
  SaveSettings();
}
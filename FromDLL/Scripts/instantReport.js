//utils-----------------------------------------------------------------------------------------------------------------------------------
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

function GetUrlParam(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
}

//ui------------------------------------------------------------------------------------------------------------
var reportName;
var constraintsList;
var typedDbSchema;

function GetConstraintsList() {
  var requestString = 'wscmd=getconstraintslist';
  AjaxRequest('./rs.aspx', requestString, GotConstraintsList, null, 'constraintslist');
}

function GotConstraintsList(returnObj, id) {
  if (id != 'constraintslist' || returnObj == undefined || returnObj == null)
    return;
  constraintsList = returnObj.Data;
}

function GetTypedDbSchema() {
  var requestString = 'wscmd=gettypeddbschema';
  AjaxRequest('./rs.aspx', requestString, GotTypedDbSchema, null, 'typeddbschema');
}

function GotTypedDbSchema(returnObj, id) {
  if (id != 'typeddbschema' || returnObj == undefined || returnObj == null)
    return;
  typedDbSchema = returnObj.PartsForTypeGroups;
}

function GetUsedTypesList(forRn) {
  var requestString = 'wscmd=getusedtypeslist&wsarg0=' + forRn;
  AjaxRequest('./rs.aspx', requestString, GotUsedTypesList, null, 'usedtypeslist');
}

function GotUsedTypesList(returnObj, id) {
  if (id != 'usedtypeslist' || returnObj == undefined || returnObj == null)
    return;
  if (returnObj.ReportSetName != null && returnObj.FieldTemplates != null && returnObj.FieldTemplates.length > 0)
    GenerateTypesList(returnObj.FieldTemplates);
}

function GenerateTypesList(templatesList) {
  var content = '<table>';
  for (var index = 0; index < templatesList.length; index++) {
    content += '<tr><td>' + templatesList[index].TypeGroupName + '</td>';
    content += '<td><input id="idv' + index + '" type="hidden" value="' + templatesList[index].Id + '" />';
    content += '<input id="tgv' + index + '" type="hidden" value="' + templatesList[index].TypeGroup + '" />';    
    content += '<input id="fnv' + index + '" type="hidden" value="" />';
    content += '<input id="fnf' + index + '" type="text" value="" style="width:500px;" /></td>';
    content += '<td>';
    if (templatesList[index].TypeGroupName.indexOf('Number') == 0 && templatesList[index].TypeGroupName.indexOf('- Filter') < 0)
      content += '&nbsp;&nbsp;&nbsp;&nbsp;<input id="cncb' + index + '" type="checkbox" />&nbsp;Count';
    content += '</td></tr>';
  }
  content += '</table>';
  var fsDiv = document.getElementById('fieldsSelectors');
  fsDiv.innerHTML = content;
  for (var index = 0; index < templatesList.length; index++) {
    var editForAutoComplite = document.getElementById('fnf' + index);
    if (editForAutoComplite == null)
      continue;
    jq$(editForAutoComplite).autocomplete({
      source: function(req, responseFunction) {
        var controlIndex = this.element[0].id.substring(3);
        var tgInput = document.getElementById('tgv' + controlIndex);
        var tgValue = tgInput.value;
        var countChecked = document.getElementById('cncb' + controlIndex);
        if (countChecked != null && countChecked.checked == true)
          tgValue = typedDbSchema.length - 1;
        GetPossibleFields(req.term, tgValue, responseFunction);
      },
      search: function() {
        var term = this.value;
        if (term.length < 2)
          return false;
      },
      focus: function() {
        return false;
      },
      select: function(event, ui) {
        this.value = ui.item.label;
        var controlIndex = this.id.substring(3);
        var fvInput = document.getElementById('fnv' + controlIndex);
        fvInput.value = ui.item.value;
        return false;
      }
    });
  }
}

function CollectSelectedFields(namePart) {
  var res = new Array();
  var index = 0;
  while (true) {
    var edit = document.getElementById('fnv' + index);
    if (edit == null)
      break;
    var val = edit.value;
    if (val != '' && val != null && val != namePart)
      res.push(val);
    index++;
  }
  return res;
}

function GetEngagedDatasources(selectedValues) {
  var engagedDs = new Array();
  for (var svIndex = 0; svIndex < selectedValues.length; svIndex++) {
    var nodes = selectedValues[svIndex].split('.');
    if (nodes.length < 3)
      continue;
    var dsName = nodes[nodes.length - 3] + '.' + nodes[nodes.length - 2];
    var exists = false;
    for (var cc = 0; cc < engagedDs.length; cc++) {
      if (engagedDs[cc] == dsName) {
        exists = true;
        break;
      }
    }
    if (exists)
      continue;
    engagedDs.push(dsName);
  }
  return engagedDs;
}

function CanBeJoined(ds1, ds2) {
  if (ds1 == ds2)
    return true;
  var result = false;
  for (var k = 0; k < constraintsList.length; k++) {
    if (constraintsList[k][0] == ds1 && constraintsList[k][1] == ds2) {
      result = true;
      break;
    }
    if (constraintsList[k][0] == ds2 && constraintsList[k][1] == ds1) {
      result = true;
      break;
    }
  }
  return result;
}

function GetJoineableTypedParts(engagedDs, typedDsParts) {
  var possibleParts = new Array();
  for (var index = 0; index < typedDsParts.Parts.length; index++) {
    if (engagedDs.length == 0) {
      possibleParts.push(typedDsParts.Parts[index]);
      continue;
    }
    var joineable = false;
    for (var eCnt = 0; eCnt < engagedDs.length; eCnt++) {
      if (CanBeJoined(engagedDs[eCnt], typedDsParts.Parts[index].Name)) {
        joineable = true;
        break;
      }
    }
    if (joineable)
      possibleParts.push(typedDsParts.Parts[index]);
  }
  return possibleParts;
}

function GetPossibleFields(namePart, typeGroup, responseFunction) {
  var selectedValues = CollectSelectedFields(namePart);
  var engagedDs = GetEngagedDatasources(selectedValues);
  var typedDsParts = typedDbSchema[typeGroup];
  var possibleTypedParts = GetJoineableTypedParts(engagedDs, typedDsParts);
  var result = new Array();
  var lowerNamePart = namePart.toLowerCase();
  for (var dsCnt = 0; dsCnt < possibleTypedParts.length; dsCnt++) {
    for (var fCnt = 0; fCnt < possibleTypedParts[dsCnt].Fields.length; fCnt++) {
      if (possibleTypedParts[dsCnt].GuiNamesLower[fCnt].indexOf(lowerNamePart) >= 0) {
        var item = new Object();
        item.value = possibleTypedParts[dsCnt].Fields[fCnt];
        item.label = possibleTypedParts[dsCnt].GuiNames[fCnt];
        result.push(item);
      }
    }
  }
  responseFunction(result);
}

function LaunchReport() {
  var res = new Array();
  var fieldsData = new Object();
  fieldsData.Assignations = new Array();
  var index = 0;
  while (true) {
    var idEdit = document.getElementById('idv' + index);
    if (idEdit == null)
      break;
    var idVal = idEdit.value;  
    var fnEdit = document.getElementById('fnv' + index);
    if (fnEdit == null)
      break;
    var fnVal = fnEdit.value;
    var cntVal = "0";
    var cntCb = document.getElementById('cncb' + index);
    if (cntCb != null && cntCb.checked == true)
      cntVal = "1"
    fieldsData.Assignations.push([idVal, fnVal, cntVal]);
    index++;
  }
  fieldsData.ReportName = reportName;
  var s = JSON.stringify(fieldsData);
  SendGenerationData(s);
}

function SendGenerationData(data) {
  var requestString = 'wscmd=launchreport&wsarg0=' + data;
  AjaxRequest('./rs.aspx', requestString, DataSent, null, 'launchreport');
}

function DataSent(returnObj, id) {
  if (id != 'launchreport' || returnObj == undefined || returnObj == null || returnObj.Value == null)
    return;
  if (returnObj.Value != 'OK')
    alert(returnObj.Value);
  else
    window.location = returnObj.AdditionalData[0];
}

function Initialize() {
  reportName = GetUrlParam('rn');
  GetConstraintsList();
  GetTypedDbSchema();
  GetUsedTypesList(reportName);
}

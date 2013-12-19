<%@ Control Language="C#" AutoEventWireup="true" %>

<%@ Register TagPrefix="cc1" Namespace="Izenda.Web.UI" Assembly="Izenda.AdHoc" %>

<div class="report-page">
	<form id="form1" runat="server">
	  <div id="repHeader"></div>
		<cc1:adhocreportdesigner id="Adhocreportdesigner1" runat="server" ></cc1:adhocreportdesigner>
	</form>
</div>

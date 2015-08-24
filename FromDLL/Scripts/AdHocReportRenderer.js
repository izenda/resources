AdHoc.Classes.ReportRenderer = AdHoc.jQuery.Class.create({
	init: function () {
	},
	RenderReportSet: function(name, callback){
		AdHoc.$.ajax( {
			type: "POST",
			contenttype: "application/json; charset=utf-8", 
			data: "reportName=" + name,
			url: AdHoc.Webservices.ReportRenderer.RenderReportSet,
			dataTyp:"json", 
			success: callback
		})
	},
	RenderReportSetWithFilters : function(name, callback, filters){
		AdHoc.$.ajax( {
			type: "POST",
			contenttype: "application/json; charset=utf-8", 
			data: "reportName=" + name+"&filters = "+JSON.stringify(filters),
			url: AdHoc.Webservices.ReportRenderer.RenderReportSetWithFilters,
			dataTyp:"json", 
			success: callback
		})
	},
	ExportReportSet: function(name, exportType, filters) {
		/*AdHoc.jQuery('<form action="'+ AdHoc.Webservices.ReportRenderer.ExportReportSet +'" method="post"></form>')
		.appendTo('body').submit(
			"reportName=" + name+"&output=" + exportType + (filters == null ? "" : ("&filters="+JSON.stringify(filters)))
		);*/
		 //.remove();
		/*AdHoc.$.ajax( {
			type: "POST",
			contenttype: "application/json; charset=utf-8", 
			data: "reportName=" + name+"&output=" + exportType + (filters == null ? "" : ("&filters="+JSON.stringify(filters))),
			url: AdHoc.Webservices.ReportRenderer.ExportReportSet,
			dataTyp:"json",
			success: function(param1, param2, param3) {
				alert(1);
			}
		})*/
		AdHoc.jQuery.download(
			AdHoc.Webservices.ReportRenderer.ExportReportSet,
			"reportName=" + name+"&output=" + exportType + (filters == null ? "" : ("&filters="+JSON.stringify(filters)))
		);
		/*AdHoc.$.ajax( {
			type: "POST",
			contenttype: "application/json; charset=utf-8", 
			data: "reportName=" + name+"&output=" + exportType + (filters == null ? "" : "&filters = "+JSON.stringify(filters)),
			url: AdHoc.Webservices.ReportRenderer.ExportReportSet,
			dataTyp:"json", 
			success: callback
		})*/
	}
});

AdHoc.ReportRenderer = new AdHoc.Classes.ReportRenderer();

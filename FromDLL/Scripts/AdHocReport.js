AdHoc.Classes.Report = AdHoc.jQuery.Class.create({ 
	init: function (reportName) {
		this._reportName = reportName;
	},
	GetFilters: function(callback) {
		AdHoc.$.ajax( {
			type: "POST",
			contenttype: "application/json; charset=utf-8", 
			data: "reportName=" + this._reportName,
			url: AdHoc.Webservices.Repoprt.GetFilters,
			dataTyp:"json", 
			success: function(data) {
				var JSONFilters = AdHoc.$.parseJSON(AdHoc.$(data).text());
				callback(JSONFilters);
			}
		})
	}
});

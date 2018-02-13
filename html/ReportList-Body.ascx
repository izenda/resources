<%@ Control AutoEventWireup="true" %>
<%@ Import namespace="Izenda.AdHoc" %>

<div class="iz-rl-root">
	<div class="middle">
		<div class="iz-rl-right-panel">
			<ul class="right-panel-menu">
				<li>
					<a type="button" class="btn open-menu-mobile">
						<span class="line"></span>
						<span class="line"></span>
						<span class="line"></span>
					</a>
				</li>
				<li class="right">
					<div class="mobile-header">Uncategorized</div>
				</li>
			</ul>
			<div id="loadingDiv">
				<div id="loadingWord" lang-text="js_Loading">Loading...</div>
				<img id="loadingImg" alt="" src='./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=loading.gif' />
			</div>
			<div id="reportListDiv" style="visibility: hidden;" class="iz-rl-right-panel-content"></div>
		</div>
		<div class="iz-rl-left-panel-backdrop"></div>
		<div class="iz-rl-left-panel">
			<!-- search panel -->
			<a type="button" class="btn open-menu-mobile">
				<span class="line"></span>
				<span class="line"></span>
				<span class="line"></span>
			</a>
			<div class="iz-rl-search-panel">
				<input type="text" value="" />
				<span class="cancel-search-icon"></span>
				<span class="search-icon"></span>
				<img class="search-progress-icon" lang-title="js_Searching" 
					lang-alt="js_Searching" title="Searching..." alt="Searching..."
					src="./<%=AdHocSettings.ResourcesProviderUniqueUrlWithDelimiter%>image=searching-icon.gif" />
			</div>
			<!-- categories -->
			<h2 lang-text="js_Categories">Categories</h2>
			<div id="leftSideCats"></div>
			<!-- recent -->
			<h2 lang-text="js_Recent">Recent</h2>
			<div id="recentReports"></div>
		</div>
	</div>
</div>

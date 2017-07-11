

jQ.fn.selectToUISlider = function(settings){
	var selects = jQ(this);
	
	//accessible slider options
	var options = jQ.extend({
		labels: 3, //number of visible labels
		tooltip: true, //show tooltips, boolean
		tooltipSrc: 'text',//accepts 'value' as well
		labelSrc: 'value',//accepts 'value' as well	,
		sliderOptions: null
	}, settings);


	//handle ID attrs - selects each need IDs for handles to find them
	var handleIds = (function(){
		var tempArr = [];
		selects.each(function(){
			tempArr.push('handle_'+jQ(this).attr('id'));
		});
		return tempArr;
	})();
	
	//array of all option elements in select element (ignores optgroups)
	var selectOptions = (function(){
		var opts = [];
		selects.eq(0).find('option').each(function(){
			opts.push({
				value: jQ(this).attr('value'),
				text: jQ(this).text()
			});
		});
		return opts;
	})();
	
	//array of opt groups if present
	var groups = (function(){
		if(selects.eq(0).find('optgroup').size()>0){
			var groupedData = [];
			selects.eq(0).find('optgroup').each(function(i){
				groupedData[i] = {};
				groupedData[i].label = jQ(this).attr('label');
				groupedData[i].options = [];
				jQ(this).find('option').each(function(){
					groupedData[i].options.push({text: jQ(this).text(), value: jQ(this).attr('value')});
				});
			});
			return groupedData;
		}
		else return null;
	})();	
	
	//check if obj is array
	function isArray(obj) {
		return obj.constructor == Array;
	}
	//return tooltip text from option index
	function ttText(optIndex){
		return (options.tooltipSrc == 'text') ? selectOptions[optIndex].text : selectOptions[optIndex].value;
	}
	
	//plugin-generated slider options (can be overridden)
	var sliderOptions = {
		step: 1,
		min: 0,
		orientation: 'horizontal',
		max: selectOptions.length-1,
		range: selects.length > 1,//multiple select elements = true
		slide: function(e, ui) {//slide function
				var thisHandle = jQ(ui.handle);
				//handle feedback 
				var textval = ttText(ui.value);
				thisHandle
					.attr('aria-valuetext', textval)
					.attr('aria-valuenow', ui.value)
					.find('.iz-ui-slider-tooltip .ttContent')
						.text( textval );

				//control original select menu
				var currSelect = jQ('#' + thisHandle.attr('id').split('handle_')[1]);
				currSelect.find('option').eq(ui.value).attr('selected', 'selected');
				currSelect.change();
		},
		values: (function(){
			var values = [];
			selects.each(function(){
				values.push( jQ(this).get(0).selectedIndex );
			});
			return values;
		})()
	};
	
	//slider options from settings
	options.sliderOptions = (settings) ? jQ.extend(sliderOptions, settings.sliderOptions) : sliderOptions;
		
	//select element change event	
	selects.bind('change keyup click', function(){
		var thisIndex = jQ(this).get(0).selectedIndex;
		var thisHandle = jQ('#handle_'+ jQ(this).attr('id'));
		var handleIndex = thisHandle.data('handleNum');
		thisHandle.parents('.iz-ui-slider:eq(0)').slider("values", handleIndex, thisIndex);
	});
	

	//create slider component div
	var sliderComponent = jQ('<div></div>');

	//CREATE HANDLES
	selects.each(function(i){
		var hidett = '';
		
		//associate label for ARIA
		var thisLabel = jQ('label[for=' + jQ(this).attr('id') +']');
		//labelled by aria doesn't seem to work on slider handle. Using title attr as backup
		var labelText = (thisLabel.size()>0) ? 'Slider control for '+ thisLabel.text()+'' : '';
		var thisLabelId = thisLabel.attr('id') || thisLabel.attr('id', 'label_'+handleIds[i]).attr('id');
		
		
		if( options.tooltip == false ){hidett = ' style="display: none;"';}
		jQ('<a '+
				'href="#" tabindex="0" '+
				'id="'+handleIds[i]+'" '+
				'class="iz-ui-slider-handle" '+
				'role="slider" '+
				'aria-labelledby="'+thisLabelId+'" '+
				'aria-valuemin="'+options.sliderOptions.min+'" '+
				'aria-valuemax="'+options.sliderOptions.max+'" '+
				'aria-valuenow="'+options.sliderOptions.values[i]+'" '+
				'aria-valuetext="'+ttText(options.sliderOptions.values[i])+'" '+
			'><span class="screenReaderContext">'+labelText+'</span>'+
			'<span class="iz-ui-slider-tooltip iz-ui-widget-content iz-ui-corner-all"'+ hidett +'><span class="ttContent"></span>'+
				'<span class="iz-ui-tooltip-pointer-down iz-ui-widget-content"><span class="iz-ui-tooltip-pointer-down-inner"></span></span>'+
			'</span></a>')
			.data('handleNum',i)
			.appendTo(sliderComponent);
	});
	
	//CREATE SCALE AND TICS
	
	//write dl if there are optgroups
	if(groups) {
		var inc = 0;
		var scale = sliderComponent.append('<dl class="iz-ui-slider-scale iz-ui-helper-reset" role="presentation"></dl>').find('.iz-ui-slider-scale:eq(0)');
		jQ(groups).each(function(h){
			scale.append('<dt style="width: '+ (100/groups.length).toFixed(2) +'%' +'; left:'+ (h/(groups.length-1) * 100).toFixed(2)  +'%' +'"><span>'+this.label+'</span></dt>');//class name becomes camelCased label
			var groupOpts = this.options;
			jQ(this.options).each(function(i){
				var style = (inc == selectOptions.length-1 || inc == 0) ? 'style="display: none;"' : '' ;
				var labelText = (options.labelSrc == 'text') ? groupOpts[i].text : groupOpts[i].value;
				scale.append('<dd style="left:'+ leftVal(inc) +'"><span class="iz-ui-slider-label">'+ labelText +'</span><span class="iz-ui-slider-tic iz-ui-widget-content"'+ style +'></span></dd>');
				inc++;
			});
		});
	}
	//write ol
	else {
		var scale = sliderComponent.append('<ol class="iz-ui-slider-scale iz-ui-helper-reset" role="presentation"></ol>').find('.iz-ui-slider-scale:eq(0)');
		jQ(selectOptions).each(function(i){
			var style = (i == selectOptions.length-1 || i == 0) ? 'style="display: none;"' : '' ;
			var labelText = (options.labelSrc == 'text') ? this.text : this.value;
			scale.append('<li style="left:'+ leftVal(i) +'"><span class="iz-ui-slider-label">'+ labelText +'</span><span class="iz-ui-slider-tic iz-ui-widget-content"'+ style +'></span></li>');
		});
	}
	
	function leftVal(i){
		return (i/(selectOptions.length-1) * 100).toFixed(2)  +'%';
		
	}
	

	
	
	//show and hide labels depending on labels pref
	//show the last one if there are more than 1 specified
	//if(options.labels > 1) sliderComponent.find('.iz-ui-slider-scale li:last span.iz-ui-slider-label, .iz-ui-slider-scale dd:last span.iz-ui-slider-label').addClass('iz-ui-slider-label-show');

	//set increment
	var increm = Math.max(1, Math.round(selectOptions.length / options.labels));
	//show em based on inc
	//for(var j=0; j<selectOptions.length; j+=increm){
//		if((selectOptions.length - j) > increm){//don't show if it's too close to the end label
			//sliderComponent.find('.iz-ui-slider-scale li:eq('+ j +') span.iz-ui-slider-label, .iz-ui-slider-scale dd:eq('+ j +') span.iz-ui-slider-label').addClass('iz-ui-slider-label-show');
		//}
	//}

	//style the dt's
	sliderComponent.find('.iz-ui-slider-scale dt').each(function(i){
		jQ(this).css({
			'left': ((100 /( groups.length))*i).toFixed(2) + '%'
		});
	});
	

	//inject and return 
	sliderComponent
	.insertAfter(jQ(this).eq(this.length-1))
	.slider(options.sliderOptions)
	.attr('role','application')
	.find('.iz-ui-slider-label')
	.each(function(){
		jQ(this).css('marginLeft', -jQ(this).width()/2);
	});
	
	//update tooltip arrow inner color
	sliderComponent.find('.iz-ui-tooltip-pointer-down-inner').each(function(){
				var bWidth = jQ('.iz-ui-tooltip-pointer-down-inner').css('borderTopWidth');
				var bColor = jQ(this).parents('.iz-ui-slider-tooltip').css('backgroundColor')
				jQ(this).css('border-top', bWidth+' solid '+bColor);
	});
	
	var values = sliderComponent.slider('values');
	
	if(isArray(values)){
		jQ(values).each(function(i){
			sliderComponent.find('.iz-ui-slider-tooltip .ttContent').eq(i).text( ttText(this) );
		});
	}
	else {
		sliderComponent.find('.iz-ui-slider-tooltip .ttContent').eq(0).text( ttText(values) );
	}
	
	return this;
}



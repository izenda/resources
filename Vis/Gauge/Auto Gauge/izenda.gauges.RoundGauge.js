(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.RoundGauge = function (options) {
		var gauge = this;

		var context = jq$.extend({
			diameter: 170,
			color: '#00c0d8',
			backgroundColor: '#e1e1e1'
		}, options);

		var eventService = izenda.services.createPubSubService();

		(function init() {
			context.width = context.diameter;
			context.height = context.diameter * 1.3;

			context.centerX = context.diameter * 0.5;
			context.centerY = context.diameter * 0.5;

			context.arcs = {};
			context.label = {};

			context.duration = 1000;
			context.minValue = 0;
			context.maxValue = 100;

			if (typeof context.data.max !== 'undefined') {
				context.maxValue = context.data.max.value;
			} else if (context.data.items.length > 1) {
				context.maxValue = context.data.items[1].value;
			} else {
				if (context.data.items[0].format.isPercentage) {
					context.maxValue = 100;
				} else {
					context.maxValue = context.data.items[0].value;
				}
			}

			context.label.durationFadeIn = 450;
			context.label.durationFadeOut = 150;

			context.isFraction = ((typeof context.data.max !== 'undefined') || context.data.items.length > 1);

			var value = context.data.items[0].value;
			if (context.data.items[0].format.isPercentage && !context.isFraction) {
				value *= 100;
			}
			context.ratio = (value - context.minValue) / (context.maxValue - context.minValue);
		})();

		function complexInterpolate(objA, objB) {
			var result = jq$.extend({}, objA);
			var funcs = {};
			for (var key in result) {
				if (objA.hasOwnProperty(key)) {
					var p1 = objA[key], p2 = objB[key];
					if (p1 !== p2) {
						if (key.toLowerCase().indexOf('color') >= 0) {
							funcs[key] = d3v4.interpolateRgb(d3v4.rgb(p1), d3v4.rgb(p2));
						} else {
							funcs[key] = d3v4.interpolate(p1, p2);
						}
					}
				}
			}
			return function (t) {
				for (var key in funcs) {
					if (objA.hasOwnProperty(key)) {
						result[key] = funcs[key](t);
					}
				}
				return result;
			};
		}

		function getParentControl() {
			var control = {};

			control.element = d3v4.select(context.parent);

			return control;
		}

		function createContainerControl(parent) {
			var control = {};

			var svgElement = parent.element.append('svg');
			var groupElement = svgElement.append('g');

			function getCalculatedState() {
				var width = context.width;
				var height = context.height;
				return {
					width: width,
					height: height
				};
			}

			function applyState(state) {
				control.state = state;

				svgElement
					.attr('width', state.width)
					.attr('height', state.height);
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			}

			control.element = groupElement;
			control.state = getCalculatedState();

			control.updateState();

			return control;
		}

		function updateScaleControlState(arc) {
			function applyArcState(arc, state) {
				arc.state = state;

				arc.object
					.startAngle(state.startAngle)
					.endAngle(state.endAngle)
					.innerRadius(state.innerRadius)
					.outerRadius(state.outerRadius);

				if (state.color) {
					arc.path.attr('fill', state.color);
				}

				arc.path.attr('d', arc.object);
			}

			function updateState() {
				var currentState = arc.state,
					newState = arc.getCalculatedState();

				if (context.animation) {
					arc.path
						.transition()
						.duration(context.duration)
						.tween('d', function (d) {
							var ci = complexInterpolate(currentState, newState);
							return function (t) {
								applyArcState(arc, ci(t));
							};
						});
				} else {
					applyArcState(arc, newState);
				}
			}

			updateState();
		}

		function initBackgroundScaleControlPart(parent) {
			var arc = {};

			arc.object = d3v4.arc();

			arc.path = parent.element.append('path')
				.attr('class', 'izenda-vis-gauge-arc');

			function getCalculatedState(tween) {
				var degShift = context.degree === 360 ? 0 : -context.degree / 2;

				var startAngle = (tween ? degShift : (Math.min(context.degree * context.ratio, context.degree) + degShift)) * (Math.PI / 180);
				var endAngle = (degShift + context.degree) * (Math.PI / 180);

				var outerRadius = context.diameter * 0.5;
				var innerRadius = outerRadius * (1 - context.tickness * 0.01);
				if (outerRadius - innerRadius < 1) {
					innerRadius = outerRadius - 1;
				}

				var color = context.backgroundColor;

				return {
					startAngle: startAngle,
					endAngle: endAngle,
					innerRadius: innerRadius,
					outerRadius: outerRadius,
					color: color
				};
			}

			arc.updateState = function () {
				updateScaleControlState(arc);
			};

			arc.getCalculatedState = getCalculatedState;
			arc.state = getCalculatedState(context.texttween);

			eventService.subscribe('TicknessChange', arc.updateState);
			eventService.subscribe('DegreeChange', arc.updateState);
			eventService.subscribe('ColorBackgroundChange', arc.updateState);

			arc.updateState();
		}

		function initValueScaleControlPart(parent) {
			var arc = {};

			arc.object = d3v4.arc();

			arc.path = parent.element.append('path')
				.attr('class', 'izenda-vis-gauge-arc');

			function getCalculatedState(tween) {
				var degShift = context.degree === 360 ? 0 : -context.degree / 2;

				var startAngle = degShift * (Math.PI / 180);
				var endAngle = tween ? startAngle : (Math.min(context.degree * context.ratio, context.degree) + degShift) * (Math.PI / 180);

				var outerRadius = context.diameter * 0.5;
				var innerRadius = outerRadius * (1 - context.tickness * 0.01);
				if (outerRadius - innerRadius < 1) {
					innerRadius = outerRadius - 1;
				}

				var color = context.color;

				return {
					startAngle: startAngle,
					endAngle: endAngle,
					innerRadius: innerRadius,
					outerRadius: outerRadius,
					color: color
				};
			}

			arc.updateState = function () {
				updateScaleControlState(arc);
			};

			arc.getCalculatedState = getCalculatedState;
			arc.state = getCalculatedState(context.texttween);

			eventService.subscribe('TicknessChange', arc.updateState);
			eventService.subscribe('DegreeChange', arc.updateState);
			eventService.subscribe('ColorValueChange', arc.updateState);

			arc.updateState();
		}

		function initRegionScaleControlPart(parent) {
			context.regions = jq$.grep([context.data.low, context.data.high, context.data.target], function (n, i) { return (typeof n !== 'undefined'); });

			context.regions.forEach(function (region) {
				var arc = {};

				arc.object = d3v4.arc();

				arc.path = parent.element.append('path')
					.attr('class', 'izenda-vis-gauge-arc');

				function getCalculatedState() {
					var regionFactor = 5;

					var outerRadius = context.diameter * 0.5;
					var innerRadius = outerRadius * (1 - context.tickness * 0.01);
					if (outerRadius - innerRadius < 1) {
						innerRadius = outerRadius - 1;
					}

					var regionThickness = (context.tickness > regionFactor ? regionFactor : context.tickness);
					var regionOuterRadius = innerRadius * 0.95;
					var regionInnerRadius = regionOuterRadius - regionThickness;

					var point = ((region.value > context.maxValue) ? context.maxValue : region.value) * context.degree / context.maxValue;
					if (context.degree != 360) {
						if (point == 0) {
							point += regionFactor;
						} else if (region.value > context.maxValue || point == context.degree) {
							point -= regionFactor;
						}
					}

					var degShift = context.degree == 360 ? 0 : context.degree / 2;
					var startAngle = (point - regionFactor - degShift) * (Math.PI / 180);
					var endAngle = (point + regionFactor - degShift) * (Math.PI / 180);

					return {
						startAngle: startAngle,
						endAngle: endAngle,
						innerRadius: regionInnerRadius,
						outerRadius: regionOuterRadius,
						color: region.color
					};
				}

				arc.updateState = function () {
					updateScaleControlState(arc);
				};

				arc.getCalculatedState = getCalculatedState;
				arc.state = getCalculatedState();

				eventService.subscribe('TicknessChange', arc.updateState);
				eventService.subscribe('DegreeChange', arc.updateState);

				arc.updateState();
			});
		}

		function createScaleControl(parent) {
			var control = {};

			var groupElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-arcs')
				.attr('transform', 'translate(' + context.centerX + ',' + context.centerY + ')');

			control.element = groupElement;

			initBackgroundScaleControlPart(control);
			initValueScaleControlPart(control);
			initRegionScaleControlPart(control);

			return control;
		}

		function createValueControl(parent) {
			var control = {};

			var divContainerElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-label-container');
			var divLabelElement = divContainerElement.append('div')
				.attr('class', 'izenda-vis-gauge-label-value');

			var value = context.data.items[0];
			var subValueText = null;
			if (context.isFraction) {
				var numerator = value,
					denominator = context.data.max || context.data.items[1];
				numerator.format.significant = null;
				denominator.format.significant = null;
				numerator.format.isPercentage = false;
				denominator.format.isPercentage = false;
				subValueText = '/' + izenda.utils.number.formatBigNumber(denominator.value, denominator.format);
			} else if (value.format.isPercentage) {
				subValueText = '%';
			} else if (value.format.isCurrency) {
				subValueText = value.format.currency.symbol;
			}

			var labelFontSizeFactor = 0.65 - (subValueText != null ? subValueText.length : 0) * 0.05;

			var format = jq$.extend(true, {}, value.format);
			format.showPercentSymbol = false;

			divLabelElement
				.attr('data-content', subValueText)
				.text(izenda.utils.number.formatBigNumber(value.value, format));

			function getCalculatedState() {
				var outerRadius = context.diameter * 0.5;
				var innerRadius = outerRadius * (1 - context.tickness * 0.01);
				if (outerRadius - innerRadius < 1) {
					innerRadius = outerRadius - 1;
				}

				var fontSize = innerRadius * labelFontSizeFactor;
				var top = context.centerY;
				var color = context.labelColor;

				return {
					fontSize: fontSize,
					top: top,
					color: color
				};
			}

			function applyState(state) {
				control.state = state;

				divContainerElement
					.style('font-size', state.fontSize + 'px')
					.style('top', state.top + 'px')
					.style('color', state.color);
			}

			function tweenText() {
				var value = context.data.items[0];
				var currentValue = context.minValue;
				var valueToCalcPower = context.data.items[0].value;
				if (format.isPercentage) {
					valueToCalcPower *= 100;
				}
				jq$.extend(true, value.format, {
					powerIndex: izenda.utils.number.getPowerIndex(valueToCalcPower)
				});
				divLabelElement.datum(Math.round(context.ratio * 100));

				divLabelElement
					.transition()
					.duration(context.duration)
					.on('start', function () {
						d3v4.active(this)
							.tween('text', function (a) {
								var i = d3v4.interpolate(currentValue, a);
								currentValue = i(0);
								return function (t) {
									currentValue = i(t);
									divLabelElement.text(izenda.utils.number.formatBigNumber(currentValue * context.maxValue / 100, format));
								}
							})
					})
					.on('end', function () {
						divLabelElement.text(izenda.utils.number.formatBigNumber(value.value, format));
					});
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				if (context.textanimation) {
					divContainerElement
						.transition()
						.duration(context.label.durationFadeOut)
						.style('opacity', 0)
						.on('end', function () {
							applyState(newState);
							divContainerElement
								.transition()
								.duration(context.label.durationFadeIn)
								.on('start', function () {
									if (context.texttween) {
										tweenText();
									}
								})
								.style('opacity', 1);
						});
				} else if (context.animation) {
					divContainerElement
						.transition()
						.duration(context.duration)
						.tween('d', function (d) {
							var ci = complexInterpolate(currentState, newState);
							return function (t) {
								applyState(ci(t));
							};
						});
				} else {
					applyState(newState);
					if (context.texttween) {
						tweenText();
					}
				}
			};

			(function initTooltip() {
				var services = window.ReportingServices;
				var tipContent = context.isFraction
					? (context.data.items[0].value + ' / ' + (context.data.max || context.data.items[1]).value)
					: izenda.utils.number.format(context.data.items[0].value, context.data.items[0].format);
				divLabelElement.on('mouseover', function (d) {
					services.showTip(tipContent, {
						element: divLabelElement.node(),
						style: 'sharp',
						mode: 'tooltip',
						offset: { x: -40, y: -21 },
						tipStyle: 'font-family: "Open Sans Condensed", sans-serif; font-size: 21px; padding: 0 5px; border: none; box-shadow: 2px 2px 5px 0 #7c7c7c;'
					});
				}).on('mouseout', function (d) {
					services.hideTip();
				});
			})();

			control.element = divContainerElement;
			control.state = getCalculatedState();

			eventService.subscribe('TicknessChange', control.updateState);
			eventService.subscribe('ColorLabelChange', control.updateState);

			control.updateState();

			return control;
		}

		function createTitleControl(parent) {
			var control = {};

			var divElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-title');
			var spanElement = divElement.append('span');

			function getCalculatedState() {
				var x = 0;
				var y = context.centerY;
				var approximatedDegree = ((context.degree < 180) ? 200 : ((context.degree > 340) ? 360 : context.degree + 20)) / 360;
				var dy = context.diameter * (approximatedDegree - 0.4);
				var width = context.width;
				var fontSize = context.diameter * 0.125;
				var color = context.titleColor;
				var text = context.title;
				return {
					x: x,
					y: y,
					dy: dy,
					width: width,
					fontSize: fontSize,
					color: color,
					text: text
				};
			}

			function applyState(state) {
				control.state = state;

				divElement
					.style('left', state.x + 'px')
					.style('top', (state.y + state.dy) + 'px');

				spanElement
					.style('font-size', state.fontSize + 'px')
					.style('color', state.color)
					.style('width', state.width + 'px')
					.attr('title', state.text)
					.text(state.text);
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				if (context.animation) {
					spanElement
						.transition()
						.duration(context.duration)
						.tween('d', function (d) {
							var ci = complexInterpolate(currentState, newState);
							return function (t) {
								applyState(ci(t));
							};
						});
				} else {
					applyState(newState);
				}
			};

			control.element = divElement;
			control.state = getCalculatedState();

			eventService.subscribe('DegreeChange', control.updateState);
			eventService.subscribe('ColorTitleChange', control.updateState);

			control.updateState();

			var svg = jq$(spanElement.node()).closest('svg');
			izenda.utils.html.adjustTextBlockInContainer(svg, spanElement.node());

			return control;
		}

		gauge.render = function (dynamic) {
			context.animation = dynamic;
			context.textanimation = dynamic;
			context.texttween = dynamic;
			context.duration = 1000;

			var parent = getParentControl();
			var container = createContainerControl(parent);
			createScaleControl(container);
			createTitleControl(parent);
			createValueControl(parent);
		};

		gauge.destroy = function () {
			jq$(context.parent).empty();
		};

		gauge.setTickness = function (tickness) {
			context.tickness = tickness;

			context.animation = true;
			context.textanimation = true;
			context.texttween = false;
			context.duration = 350;

			eventService.publish('TicknessChange');
		};

		gauge.setDegree = function (degree) {
			context.degree = degree;

			context.animation = true;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 250;

			eventService.publish('DegreeChange');
		};

		gauge.setColor = function (color) {
			context.color = color;

			context.animation = true;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 500;

			eventService.publish('ColorValueChange');
		};

		gauge.setBackgroundColor = function (color) {
			context.backgroundColor = color;

			context.animation = true;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 500;

			eventService.publish('ColorBackgroundChange');
		};

		gauge.setLabelColor = function (color) {
			context.labelColor = color;

			context.animation = true;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 500;

			eventService.publish('ColorLabelChange');
		};

		gauge.setTitleColor = function (color) {
			context.titleColor = color;

			context.animation = true;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 500;

			eventService.publish('ColorTitleChange');
		};
	};
})(window.izenda || (window.izenda = {}));
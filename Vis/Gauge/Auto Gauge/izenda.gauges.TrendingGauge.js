(function (ns) {
	ns.gauges = ns.gauges || {};

	ns.gauges.TrendingGauge = function (options) {
		var gauge = this;

		var context = jq$.extend({
			dateTransitionDuration: 300
		}, options);

		var eventService = izenda.services.createPubSubService();

		function getParentControl() {
			var control = {};

			control.element = d3v4.select(context.parent);

			return control;
		}

		function createContainerControl(parent) {
			var control = {};

			var svgElement = parent.element.append('svg');
			var groupElement = svgElement.append('g');

			var defsElement = svgElement.append('defs');

			var linearGradient = defsElement.append('linearGradient')
				.attr('id', 'backgroundAreaGradient')
				.attr('x1', '100%')
				.attr('y1', '100%')
				.attr('x2', '100%')
				.attr('y2', '0%')
				.attr('gradientUnits', 'userSpaceOnUse');
			linearGradient.append('stop')
				.attr('offset', '10%')
				.attr('stop-color', '#ffffff')
				.attr('stop-opacity', 1);
			linearGradient.append('stop')
				.attr('offset', '65%')
				.attr('stop-color', '#c1e5f5')
				.attr('stop-opacity', 1);

			var svgElementMouseMoveEventHandler = null;
			svgElement
				.on('mouseover', function () {
					eventService.publish('MouseOver');
				})
				.on('mouseout', function () {
					eventService.publish('MouseOut');
				})
				.on('mousemove', function () {
					if (typeof svgElementMouseMoveEventHandler === 'function') {
						svgElementMouseMoveEventHandler(this);
					}
				});

			function getCalculatedState() {
				var width = context.size;
				var height = context.size * 0.5;
				var offset = context.size * 0.02;

				return {
					width: width,
					height: height,
					offset: offset
				};
			}

			var bisectDate = d3v4.bisector(function (d) { return d.date; }).left,
				lastItem = null;
			function applyState(state) {
				control.state = state;

				svgElement
					.attr('width', state.width)
					.attr('height', state.height);

				var x = d3v4.scaleTime()
					.domain(d3v4.extent(context.data, function (d) { return d.date; }))
					.range([0, state.width - state.offset * 2]);

				var mouseMoveTimeout = null;
				svgElementMouseMoveEventHandler = function (sender) {
					var x0 = x.invert(d3v4.mouse(sender)[0]),
						i = bisectDate(context.data, x0, 1),
						d0 = context.data[i - 1],
						d1 = (i < context.data.length) ? context.data[i] : context.data[i - 1],
						item = x0 - d0.date > d1.date - x0 ? d1 : d0;

					if (item !== lastItem) {
						lastItem = item;
						clearTimeout(mouseMoveTimeout);
						mouseMoveTimeout = setTimeout(function () {
							eventService.publish('CurrentItemChange', item);
						}, 50);
					}
				};
			}

			control.updateState = function () {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			}

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createScaleControl(parent) {
			var control = {};

			var groupElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-scale');
			var areaElement = groupElement.append('path')
				.datum(context.data)
				.attr('fill', 'url(#backgroundAreaGradient)');
			var lineElement = groupElement.append('path')
				.attr('class', 'izenda-vis-gauge-line');
			var pointElement = groupElement.append('circle')
				.attr('class', 'izenda-vis-gauge-point');

			function getCalculatedState() {
				var width = context.size;
				var height = context.size * 0.5;
				var offset = context.size * 0.02;
				var lineBorderWidth = context.size * 0.003;
				var pointRadius = context.size / 60;

				return {
					width: width,
					height: height,
					offset: offset,
					lineBorderWidth: lineBorderWidth,
					pointRadius: pointRadius
				};
			}

			var subscriptionCurrentItemChange = null;

			function applyState(state) {
				control.state = state;

				if (subscriptionCurrentItemChange)
					subscriptionCurrentItemChange.remove();

				pointElement
					.attr('r', state.pointRadius);

				var x = d3v4.scaleTime()
					.domain(d3v4.extent(context.data, function (d) { return d.date; }))
					.range([0, state.width - state.offset * 2]);

				var y = d3v4.scaleLinear()
					.domain([d3v4.min(context.data, function (d) {
						return (typeof d.target === 'undefined') ? d.items[0].value : d3v4.min([d.items[0].value, d.target.value]);
					}), d3v4.max(context.data, function (d) {
						return (typeof d.target === 'undefined') ? d.items[0].value : d3v4.max([d.items[0].value, d.target.value]);
					})])
					.range([state.height * 0.52, state.height * 0.32]);

				var area = d3v4.area()
					.x(function (d) { return x(d.date); })
					.y0(state.height - state.offset * 2)
					.y1(function (d) { return y(d.items[0].value); });

				areaElement
					.attr('d', area)
					.attr('transform', 'translate(' + state.offset + ',' + state.offset + ')')
					.attr('stroke-width', 0);

				var lineFunction = d3v4.line()
					.x(function (d) { return x(d.date); })
					.y(function (d) { return y(d.items[0].value); })
					.curve(d3v4.curveLinear);
				lineElement
					.attr('d', lineFunction(context.data))
					.attr('stroke-width', state.lineBorderWidth)
					.attr('transform', 'translate(' + state.offset + ',' + state.offset + ')');

				function getPointByItem(item) {
					return {
						x: x(item.date) + state.offset,
						y: y(item.items[0].value) + state.offset
					};
				}

				var currentItemIndex = context.data.length - 1;
				var currentItem = context.data[currentItemIndex];
				var currentPoint = getPointByItem(currentItem);
				pointElement.interrupt().attr('transform', 'translate(' + currentPoint.x + ',' + currentPoint.y + ')');

				var seed = 0;
				function getUniqueId() {
					return seed++;
				}

				var inProgress = false;
				var subscriptionTransitionComplete = null;
				var lastTransitionId = null;
				function setTransformOfPoint(item) {
					if (subscriptionTransitionComplete)
						subscriptionTransitionComplete.remove();

					subscriptionTransitionComplete = eventService.subscribe('TransitionComplete', function () {
						if (item === currentItem)
							return;

						var transitionId = getUniqueId();
						lastTransitionId = transitionId;

						var itemIndex = context.data.indexOf(item);

						var states = [];

						var lastPoint = currentPoint;
						var limiter = Math.min(Math.abs(currentItemIndex - itemIndex), 10);
						function addState(index) {
							var point = getPointByItem(context.data[index]);

							var dx = lastPoint.x - point.x;
							var dy = lastPoint.y - point.y;
							var distance = Math.sqrt(dx * dx + dy * dy);
							var duration = 65 * Math.log(distance) / limiter;

							states.push({ index: index, point: point, duration: duration });
							lastPoint = point;
						}

						if (itemIndex < currentItemIndex) {
							for (var i = currentItemIndex - 1; i >= itemIndex; --i) {
								addState(i);
							}
						} else {
							for (var j = currentItemIndex + 1; j <= itemIndex; ++j) {
								addState(j);
							}
						}

						function setTransition(index) {
							if (index === states.length || transitionId !== lastTransitionId) {
								subscriptionTransitionComplete.remove();
								return;
							}

							inProgress = true;

							var newPoint = states[index].point;
							pointElement.transition().ease(d3v4.easeQuad).duration(states[index].duration)
								.attr('transform', 'translate(' + newPoint.x + ',' + newPoint.y + ')')
								.on('end', function () {
									currentItemIndex = states[index].index;
									currentItem = currentItem = context.data[currentItemIndex];
									currentPoint = newPoint;
									inProgress = false;
									eventService.publish('TransitionComplete');
									setTransition(++index);
								});
						}
						setTransition(0);
					});

					if (!inProgress)
						subscriptionTransitionComplete.raise();
				}

				subscriptionCurrentItemChange = eventService.subscribe('CurrentItemChange', function (item) {
					setTransformOfPoint(item);
				});
			}

			control.updateState = function (args) {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			};

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createTitleControl(parent) {
			var control = {};

			var divElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-title');
			var spanElement = divElement.append('span');

			function getCalculatedState() {
				var x = context.size * 0.035;
				var y = -3;
				var width = context.size * 0.585;
				var fontSize = context.size * 0.1;
				var text = context.title;

				return {
					x: x,
					y: y,
					width: width,
					fontSize: fontSize,
					text: text
				};
			}


			function applyState(state) {
				control.state = state;

				divElement
					.style('left', state.x + 'px')
					.style('top', state.y + 'px');

				spanElement
					.style('width', state.width + 'px')
					.style('font-size', state.fontSize + 'px')
					.attr('title', state.text)
					.text(state.text);
			}

			control.updateState = function (args) {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			};

			control.element = divElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createValueControl(parent) {
			var control = {};

			var groupElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-value');
			var valueElement = groupElement.append('text');

			function getCalculatedState() {
				var x = context.size * 0.05;
				var y = context.size * 0.43;
				var fontSize = context.size * 0.16;

				return {
					x: x,
					y: y,
					fontSize: fontSize
				};
			}

			var subscriptionCurrentItemChange = null;

			function applyState(state) {
				control.state = state;

				if (subscriptionCurrentItemChange)
					subscriptionCurrentItemChange.remove();

				valueElement
					.attr('x', state.x)
					.attr('y', state.y)
					.style('font-size', state.fontSize + 'px');


				function setValueByItem(item) {
					var formattedValue = izenda.utils.number.formatBigNumber(item.items[0].value, {
						precision: item.items[0].format.precision,
						suffixCase: 'LOWER',
						isPercentage: item.items[0].format.isPercentage,
						showPercentSymbol: false
					});

					valueElement.text(formattedValue);
				}

				var lastItem = context.data[context.data.length - 1];
				setValueByItem(lastItem);

				subscriptionCurrentItemChange = eventService.subscribe('CurrentItemChange', function (item) {
					setValueByItem(item);
				});
			}

			control.updateState = function (args) {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			};

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createDateControl(parent) {
			var control = {};

			var groupElement = parent.element.append('g')
				.attr('class', 'izenda-vis-gauge-date');
			var dateElement = groupElement.append('text');

			function getCalculatedState() {
				var x = context.size * 0.05;
				var y = context.size * 0.48;
				var fontSize = context.size * 0.038;

				return {
					x: x,
					y: y,
					fontSize: fontSize
				};
			}

			var subscriptionCurrentItemChange = null;

			function applyState(state) {
				control.state = state;

				if (subscriptionCurrentItemChange)
					subscriptionCurrentItemChange.remove();

				dateElement
					.attr('x', state.x)
					.attr('y', state.y)
					.style('font-size', state.fontSize + 'px');

				function setDateByItem(item) {
					var date = 'on ' + item.date.toLocaleDateString();
					dateElement.text(date);
				}

				var lastItem = context.data[context.data.length - 1];
				setDateByItem(lastItem);

				subscriptionCurrentItemChange = eventService.subscribe('CurrentItemChange', function (item) {
					setDateByItem(item);
				});
			}

			control.updateState = function (args) {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			};

			eventService.subscribe('MouseOver', function () {
				groupElement.transition().duration(context.dateTransitionDuration).style('opacity', 1);
			});
			eventService.subscribe('MouseOut', function () {
				groupElement.transition().duration(context.dateTransitionDuration).style('opacity', 0);
			});

			control.element = groupElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		function createTrendControl(parent) {
			var control = {};

			var trendElement = parent.element.append('div')
				.attr('class', 'izenda-vis-gauge-trend');

			var directionElement = trendElement.append('span')
				.attr('class', 'izenda-vis-gauge-trend-icon');
			var valueElement = trendElement.append('span');

			function getCalculatedState() {
				var x = context.size * 0.035;
				var y = -3;
				var fontSize = context.size * 0.1;


				var arrowSize = context.size * 0.075;
				var arrowRightOffset = context.size * 0.0075;

				return {
					x: x,
					y: y,
					fontSize: fontSize,
					arrowSize: arrowSize,
					arrowRightOffset: arrowRightOffset
				};
			}

			var subscriptionCurrentItemChange = null;

			function applyState(state) {
				control.state = state;

				trendElement
					.style('right', state.x + 'px')
					.style('top', state.y + 'px')
					.style('font-size', state.fontSize + 'px');

				if (subscriptionCurrentItemChange)
					subscriptionCurrentItemChange.remove();

				function setValueByItem(item) {
					var value = item.items[0].value / context.data[0].items[0].value - 1;
					var formatedValue = izenda.utils.number.formatPercent(Math.abs(value), {
						precision: 2,
						suffixCase: 'LOWER',
						asBigNumber: true
					});

					var directionClass = value > 0 ? ' izenda-vis-gauge-up' : (value < 0 ? ' izenda-vis-gauge-down' : '');
					trendElement.attr('class', 'izenda-vis-gauge-trend' + directionClass);

					directionElement
						.style('width', state.arrowSize + 'px')
						.style('height', state.arrowSize + 'px');

					valueElement
						.text(formatedValue);

				}

				var lastItem = context.data[context.data.length - 1];
				setValueByItem(lastItem);

				subscriptionCurrentItemChange = eventService.subscribe('CurrentItemChange', function (item) {
					setValueByItem(item);
				});
			}

			control.updateState = function (args) {
				var currentState = control.state,
					newState = getCalculatedState();

				applyState(newState);
			};

			control.element = trendElement;
			control.state = getCalculatedState();

			eventService.subscribe('SizeChange', control.updateState);

			control.updateState();

			return control;
		}

		gauge.render = function (dynamic) {
			context.animation = false;
			context.textanimation = false;
			context.texttween = false;
			context.duration = 500;

			var parent = getParentControl();
			var container = createContainerControl(parent);
			createScaleControl(container);
			createTitleControl(parent);
			createValueControl(container);
			createDateControl(container);
			createTrendControl(parent);
		};

		gauge.setSize = function (size) {
			context.size = size;

			context.animation = false;
			context.textanimation = false;
			context.texttween = false;

			eventService.publish('SizeChange', size);
		};
	}
})(window.izenda || (window.izenda = {}));
/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.Chart = class Chart {
            /**
             * A wave Chart encapsulates a CanvasJS chart object, a reference to a 
             * placeholder div in the DOM, and an array of pv names.
             * 
             * @param {string array} pvs - The PV names
             * @param {object} $placeholderDiv - jQuery object reference to placeholder div
             * @param {boolean} separateYAxis - true if multiple PVs should they have 
             * separate Y axis (otherwise share a single Y axis)\
             * @param {int} titleSize - chart area scaled title size in pixels
             * @param {boolean} includeTitle - true if title should be shown
             * @returns {jlab.wave.Chart} - The chart
             */
            constructor(chartManager, pvs, $placeholderDiv, separateYAxis, title, titleSize, includeTitle) {
                let _chartManager = chartManager;
                let _pvs = pvs.slice(); /* slice (not splice) makes a copy as we may be removing PVs */
                this.$placeholderDiv = $placeholderDiv;
                let labels = [],
                        data = [],
                        axisY = [];


                this.getPvs = function () {
                    return _pvs.slice(); /*return copy*/
                };

                this.setPvs = function (pvs) {
                    _pvs = pvs;
                };

                this.destroy = function () {
                    this.$placeholderDiv.remove();
                };

                let yAxisMargin = titleSize * 1.5;

                let interval = null;

                if (!separateYAxis) {
                    /*Just use first configured series yAxisLabel*/
                    let yAxisLabel = '',
                        yAxisMin = null,
                        yAxisMax = null,
                        yAxisLog = null,
                        yAxisLabelFormatter = null;

                    if(_pvs.length > 0) {
                        let pv = _pvs[0];
                        var series = wave.pvToSeriesMap[pv];
                        yAxisLabel = series.preferences.yAxisLabel,
                        yAxisMin = series.preferences.yAxisMin ? series.preferences.yAxisMin : null,
                        yAxisMax = series.preferences.yAxisMax ? series.preferences.yAxisMax : null;
                        yAxisLog = series.preferences.yAxisLog ? series.preferences.yAxisLog : null;

                        if(series.metadata !== null &&
                            series.metadata.datatype === 'DBR_ENUM' &&
                            series.metadata.labels != null) {
                            interval = 1;
                            yAxisMin = 0;
                            yAxisMax = series.metadata.labels.length - 1;
                            yAxisLabelFormatter = function(e) {
                                var label = e.value,
                                    index = Math.round(e.value);

                                if(series.metadata.labels[index] !== undefined) {
                                    label = series.metadata.labels[index];
                                }

                                return label;
                            };
                        }
                    }

                    axisY.push({
                        /*crosshair: {enabled: true},*/
                        title: yAxisLabel,
                        margin: yAxisMargin,
                        tickLength: 20,
                        includeZero: false,
                        minimum: yAxisMin,
                        maximum: yAxisMax,
                        interval: interval,
                        labelFormatter: yAxisLabelFormatter,
                        logarithmic: yAxisLog == null ? false : true
                    });
                }

                for (let i = 0; i < _pvs.length; i++) {
                    let pv = _pvs[i],
                            series = wave.pvToSeriesMap[pv],
                            metadata = series.metadata,
                            preferences = series.preferences,
                            lineDashType = "solid",
                            axisYIndex = 0,
                            color = preferences.color,
                            label = preferences.label,
                            yAxisLabel = preferences.yAxisLabel,
                            yAxisMin = preferences.yAxisMin ? preferences.yAxisMin : null,
                            yAxisMax = preferences.yAxisMax ? preferences.yAxisMax : null,
                            yAxisLog = preferences.yAxisLog ? preferences.yAxisLog : null,
                            yAxisLabelFormatter = null;

                    if(series.metadata !== null &&
                        series.metadata.datatype === 'DBR_ENUM' &&
                        series.metadata.labels != null) {
                        yAxisLabelFormatter = function(e) {
                            var label = e.value,
                                index = Math.round(e.value);

                            if(series.metadata.labels[index] !== undefined) {
                                label = series.metadata.labels[index];
                            }

                            return label;
                        }
                    }

                    if(label == null) {
                        label = pv;
                    }

                    if(yAxisLabel == null) {
                        yAxisLabel = label;
                    }

                    if (metadata !== null && metadata.sampled === true) {
                        labels[i] = label + ' (Sampled)';
                        lineDashType = "dot";
                    } else {
                        labels[i] = label;
                    }

                    if (separateYAxis) {
                        axisYIndex = i;
                        axisY.push({title: yAxisLabel, margin: yAxisMargin, tickLength: 20, includeZero: false, lineColor: color, labelFontColor: color, titleFontColor: color, minimum: yAxisMin, maximum: yAxisMax, logarithmic: yAxisLog == null ? false : true});
                    }

                    let dataOpts = {pv: pv,
                        xValueFormatString: "MMM DD YYYY HH:mm:ss",
                        toolTipContent: labels[i] + "<br/>{x}, <b>{y}</b>",
                        showInLegend: true, legendText: labels[i],
                        axisYIndex: axisYIndex,
                        color: color,
                        type: "line",
                        lineDashType:
                        lineDashType,
                        markerType: "none",
                        xValueType: "dateTime",
                        lineThickness: 3,
                        dataPoints: series.data};

                    if (series.error !== null) {
                        dataOpts.visible = false;
                    }

                    data.push(dataOpts);
                    series.chart = this;
                    series.chartSeriesIndex = i;
                }

                jlab.wave.charts.push(this);
                let minDate = _chartManager.getOptions().start,
                        maxDate = _chartManager.getOptions().end,
                        timeFormatter = new wave.ZoomableTimeFormatter(minDate, maxDate),
                        axisX = {
                            crosshair: {
                                enabled: true,
                                labelFormatter: function ( e ) {
                                    let y = '';

                                    /*console.time("search");*/
                                    /*TODO: Should this be a binary search? */
                                    for(let i = 0; i < e.chart.data[0].dataPoints.length; i++) {
                                        let point = e.chart.data[0].dataPoints[i];
                                        if(point.x > e.value) {
                                            break;
                                        } else {
                                            y = point.y;
                                        }
                                    }
                                    /*console.timeEnd("search");*/

                                    //e.chart.options.timeFormatter.tickFormat
                                    return CanvasJS.formatDate(e.value, e.chart.options.axisX.valueFormatString) + ", " + y;
                                }
                            },
                            minimum: minDate,
                            maximum: maxDate,
                            labelAutoFit: true,
                            labelWrap: false,
                            /*labelMaxWidth: 200,*/
                            tickLength: 20,
                            valueFormatString: 'YYYY-MM-DD HH:mm:ss'
                        };

                // TODO: Create separate ArchiveChart vs StripChart
                //if (_chartManager.getOptions().viewerMode === wave.viewerModeEnum.ARCHIVE) {
                axisX = $.extend(axisX, {
                    tickThickness: 0.6,
                    gridThickness: 0.6,
                    gridColor: 'rgb(169,169,169, 0.25)',
                    valueFormatString: timeFormatter.startingTickFormat,
                    interval: timeFormatter.startingInterval,
                    intervalType: timeFormatter.startingIntervalType,
                    labelAngle: -45//,
                            //minimum: minDate,
                            //maximum: maxDate
                }
                );
                //}

                let subtitle;

                if (includeTitle) {
                    subtitle = timeFormatter.title;
                } else {
                    title = null;
                }

                if (_chartManager.getOptions().viewerMode === wave.viewerModeEnum.STRIP) {
                    subtitle = jlab.wave.util.toUserDateTimeString(minDate) + ' +';
                }

                let subtitleSize = titleSize * 0.75;

                axisX.labelFontSize = subtitleSize;

                for (let i = 0; i < axisY.length; i++) {
                    axisY[i].labelFontSize = subtitleSize;
                    axisY[i].titleFontSize = subtitleSize;
                    axisY[i].gridThickness = 0.6;
                    axisY[i].gridColor = 'rgb(169,169,169, 0.25)';
                    axisY[i].tickThickness = 0.6;
                }

                let canvasOpts = {
                    toolTip: {enabled: false},
                    timeFormatter: timeFormatter,
                    title: {
                        text: title,
                        fontSize: titleSize
                    },
                    subtitles: [
                        {
                            text: subtitle,
                            fontSize: subtitleSize
                        }
                    ],
                    legend: {
                        fontSize: subtitleSize,
                        horizontalAlign: "center",
                        verticalAlign: "top",
                        cursor: "pointer",
                        itemclick: function (e) {
                            /*console.log(e);*/
                            jlab.wave.selectedSeries = e;

                            let series = wave.pvToSeriesMap[e.dataSeries.pv],
                                preferences = series.preferences;

                            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                                $("#pv-visibility-toggle-button").text("Hide");
                            } else {
                                $("#pv-visibility-toggle-button").text("Show");
                            }

                            $("#pv-panel h2").text(e.dataSeries.pv);


                            $("#pv-label").val(preferences.label);
                            $("#pv-color").val(preferences.color);
                            $("#pv-y-axis-label").val(preferences.yAxisLabel);
                            $("#pv-y-axis-min").val(preferences.yAxisMin);
                            $("#pv-y-axis-max").val(preferences.yAxisMax);
                            $("#pv-y-axis-log").val(preferences.yAxisLog);
                            $("#pv-scaler").val(preferences.scaler);

                            /*BEGIN PART THAT COULD BE DEFERRED*/
                            $("#metadata-popup h2").text(e.dataSeries.pv);

                            let metadata = series.metadata;

                            $("#pv-panel-error").text(series.error || "");

                            $("#metadata-datatype").text(metadata.datatype);
                            $("#metadata-host").text(metadata.datahost);
                            $("#metadata-count").text(metadata.count ? wave.util.intToStringWithCommas(metadata.count) : '');
                            $("#metadata-sampled").text(metadata.sampled);
                            $("#metadata-sampled-count").text(metadata.sampledcount ? wave.util.intToStringWithCommas(metadata.sampledcount) : 'N/A');
                            $("#metadata-stepped-count").text(metadata.steppedcount ? wave.util.intToStringWithCommas(metadata.steppedcount) : '');
                            $("#statistics-popup h2").text(e.dataSeries.pv);
                            $("#metadata-max").text(isFinite(metadata.max) ? metadata.max.toLocaleString() : '');
                            $("#metadata-min").text(isFinite(metadata.min) ? metadata.min.toLocaleString() : '');
                            /*END PART THAT COULD BE DEFERRED*/

                            $("#pv-panel").panel("open");
                        },
                        itemmouseover: function (e) {
                            $(e.chart._canvasJSContainer).attr("title", "PV Menu");
                        },
                        itemmouseout: function (e) {
                            $(e.chart._canvasJSContainer).removeAttr("title");
                        }
                    },
                    axisY: axisY,
                    axisX: axisX,
                    data: data
                };

                if (!jlab.wave.util.hasTouch() && (_chartManager.getOptions().viewerMode === wave.viewerModeEnum.ARCHIVE)) {
                    canvasOpts.zoomEnabled = true;
                    canvasOpts.zoomType = "xy";
                    canvasOpts.exportEnabled = true;
                    canvasOpts.rangeChanging = _chartManager.zoomRangeChange;
                }

                this.canvasjsChart = new CanvasJS.Chart($placeholderDiv.attr("id"), canvasOpts);
            }
        };
    }
    )(jlab.wave || (jlab.wave = {}
    ));
})(jlab || (jlab = {}));


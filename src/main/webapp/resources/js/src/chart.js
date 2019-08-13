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
                let _$placeholderDiv = $placeholderDiv;
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
                    _$placeholderDiv.remove();
                };

                let yAxisMargin = titleSize * 1.5;

                if (!separateYAxis) {
                    /*Just use first configured series yAxisLabel*/
                    let yAxisLabel = '';

                    if(_pvs.length > 0) {
                        let pv = _pvs[0];
                        let series = wave.pvToSeriesMap[pv];
                        yAxisLabel = series.preferences.yAxisLabel;
                    }

                    axisY.push({
                        title: yAxisLabel,
                        margin: yAxisMargin,
                        tickLength: 20,
                        includeZero: false
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
                            yAxisLabel = preferences.yAxisLabel;

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
                        axisY.push({title: yAxisLabel, margin: yAxisMargin, tickLength: 20, includeZero: false, lineColor: color, labelFontColor: color, titleFontColor: color});
                    }

                    let dataOpts = {pv: pv, xValueFormatString: "MMM DD YYYY HH:mm:ss", toolTipContent: labels[i] + "<br/>{x}, <b>{y}</b>", showInLegend: true, legendText: labels[i], axisYIndex: axisYIndex, color: color, type: "line", lineDashType: lineDashType, markerType: "none", xValueType: "dateTime", dataPoints: series.data};

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
                            labelAutoFit: true,
                            labelWrap: false,
                            /*labelMaxWidth: 200,*/
                            tickLength: 20,
                            valueFormatString: 'YYYY-MM-DD HH:mm:ss'
                        };

                // TODO: Create separate ArchiveChart vs StripChart
                //if (_chartManager.getOptions().viewerMode === wave.viewerModeEnum.ARCHIVE) {
                axisX = $.extend(axisX, {
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
                }

                let canvasOpts = {
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
                        horizontalAlign: "center",
                        verticalAlign: "top",
                        cursor: "pointer",
                        itemclick: function (e) {
                            /*console.log(e);*/
                            jlab.wave.selectedSeries = e;
                            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                                $("#pv-visibility-toggle-button").text("Hide");
                            } else {
                                $("#pv-visibility-toggle-button").text("Show");
                            }

                            $("#pv-panel h2").text(e.dataSeries.pv);

                            $("#pv-label").val(e.dataSeries.legendText);
                            $("#pv-color").val(e.dataSeries.color);
                            $("#pv-y-axis-label").val(e.chart.axisY[e.dataSeries.axisYIndex].options.title);

                            /*BEGIN PART THAT COULD BE DEFERRED*/
                            $("#metadata-popup h2").text(e.dataSeries.pv);
                            let series = wave.pvToSeriesMap[e.dataSeries.pv],
                                    metadata = series.metadata;

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


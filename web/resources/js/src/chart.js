/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /**
         * A wave Chart encapsulates a CanvasJS chart object, a reference to a 
         * placeholder div in the DOM, and an array of pv names.
         * 
         * @param {string array} pvs - The PV names
         * @param {object} $placeholderDiv - jQuery object reference to placeholder div
         * @param {boolean} separateYAxis - true if multiple PVs should they have 
         * separate Y axis (otherwise share a single Y axis)
         * @returns {jlab.wave.Chart} - The chart
         */
        wave.Chart = class Chart {
            constructor(chartManager, pvs, $placeholderDiv, separateYAxis) {
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

                if (!separateYAxis) {
                    axisY.push({
                        title: '',
                        margin: 60,
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
                            color = preferences.color;
                    if (metadata.sampled === true) {
                        labels[i] = pv + ' (Sampled)';
                        lineDashType = "dot";
                    } else {
                        labels[i] = pv;
                    }

                    if (separateYAxis) {
                        axisYIndex = i;
                        axisY.push({title: pv + ' Value', margin: 60, tickLength: 20, includeZero: false, lineColor: color, labelFontColor: color, titleFontColor: color});
                    }

                    data.push({pv: pv, xValueFormatString: "MMM DD YYYY HH:mm:ss", toolTipContent: "{x}, <b>{y}</b>", showInLegend: true, legendText: labels[i], axisYIndex: axisYIndex, color: color, type: "line", lineDashType: lineDashType, markerType: "none", xValueType: "dateTime", dataPoints: series.data});
                    series.chart = this;
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
                if (_chartManager.getOptions().viewerMode === wave.viewerModeEnum.ARCHIVE) {
                    axisX = $.extend(axisX, {
                        valueFormatString: timeFormatter.startingTickFormat,
                        interval: timeFormatter.startingInterval,
                        intervalType: timeFormatter.startingIntervalType,
                        labelAngle: -45,
                        minimum: minDate,
                        maximum: maxDate}
                    );
                }

                this.canvasjsChart = new CanvasJS.Chart($placeholderDiv.attr("id"), {
                    zoomEnabled: true,
                    exportEnabled: true,
                    rangeChanging: _chartManager.zoomRangeChange,
                    timeFormatter: timeFormatter,
                    title: {
                        text: timeFormatter.title
                    },
                    legend: {
                        horizontalAlign: "center",
                        verticalAlign: "top",
                        cursor: "pointer",
                        itemclick: function (e) {
                            jlab.wave.selectedSeries = e;
                            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                                $("#pv-visibility-toggle-button").text("Hide");
                            } else {
                                $("#pv-visibility-toggle-button").text("Show");
                            }

                            $("#pv-panel h2").text(e.dataSeries.pv);
                            /*BEGIN PART THAT COULD BE DEFERRED*/
                            $("#metadata-popup h2").text(e.dataSeries.pv);
                            let series = wave.pvToSeriesMap[e.dataSeries.pv],
                                    metadata = series.metadata;
                            $("#metadata-datatype").text(metadata.datatype);
                            $("#metadata-host").text(metadata.datahost);
                            $("#metadata-count").text(metadata.count ? wave.util.intToStringWithCommas(metadata.count) : '');
                            $("#metadata-sampled").text(metadata.sampled);
                            $("#metadata-sampled-count").text(metadata.sampledcount ? wave.util.intToStringWithCommas(metadata.sampledcount) : 'N/A');
                            $("#metadata-stepped-count").text(metadata.steppedcount ? wave.util.intToStringWithCommas(metadata.steppedcount) : '');
                            $("#statistics-popup h2").text(e.dataSeries.pv);
                            $("#metadata-max").text(metadata.max ? wave.util.intToStringWithCommas(metadata.max) : '');
                            $("#metadata-min").text(metadata.min ? wave.util.intToStringWithCommas(metadata.min) : '');
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
                });
            }
        };
    }
    )(jlab.wave || (jlab.wave = {}
    ));
})(jlab || (jlab = {}));


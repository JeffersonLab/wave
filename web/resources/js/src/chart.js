jlab = jlab || {};
jlab.wave = jlab.wave || {};

/**
 * Constructor for Chart object. 
 * 
 * A wave Chart encapsulates a CanvasJS chart object, a reference to a 
 * placeholder div in the DOM, and an array of pv names.
 * 
 * @param {string array} pvs - The PV names
 * @param {object} $placeholderDiv - jQuery object reference to placeholder div
 * @param {boolean} separateYAxis - true if multiple PVs should they have 
 * separate Y axis (otherwise share a single Y axis)
 * @returns {jlab.wave.Chart} - The chart
 */
jlab.wave.Chart = function (pvs, $placeholderDiv, separateYAxis) {
    this.pvs = pvs.slice(); /* slice (not splice) makes a copy as we may be removing PVs */
    this.$placeholderDiv = $placeholderDiv;

    let labels = [],
            data = [],
            axisY = [];

    if (!separateYAxis) {
        axisY.push({
            title: '',
            margin: 60,
            tickLength: 20,
            includeZero: false
        });
    }

    for (let i = 0; i < this.pvs.length; i++) {
        let pv = this.pvs[i],
                series = jlab.wave.pvToSeriesMap[pv],
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
    /*jlab.wave.idToChartMap[chartId] = this;*/
    let minDate = jlab.wave.startDateAndTime,
            maxDate = jlab.wave.endDateAndTime,
            timeFormatter = new jlab.wave.ZoomableTimeFormatter(minDate, maxDate),
            axisX = {
                labelAutoFit: true,
                labelWrap: false,
                /*labelMaxWidth: 200,*/
                tickLength: 20,
                valueFormatString: 'YYYY-MM-DD HH:mm:ss'
            };

    if (jlab.wave.controller.getViewerMode() === jlab.wave.viewerModeEnum.ARCHIVE) {
        axisX = $.extend(axisX, {
            valueFormatString: timeFormatter.startingTickFormat,
            interval: timeFormatter.startingInterval,
            intervalType: timeFormatter.startingIntervalType,
            labelAngle: -45,
            minimum: minDate,
            maximum: maxDate}
        );
    }
    
    console.log(axisX);

    this.canvasjsChart = new CanvasJS.Chart($placeholderDiv.attr("id"), {
        zoomEnabled: true,
        exportEnabled: true,
        rangeChanging: jlab.wave.controller.zoomRangeChange,
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
                let series = jlab.wave.pvToSeriesMap[e.dataSeries.pv],
                        metadata = series.metadata;
                $("#metadata-datatype").text(metadata.datatype);
                $("#metadata-host").text(metadata.datahost);
                $("#metadata-count").text(metadata.count ? jlab.wave.util.intToStringWithCommas(metadata.count) : '');
                $("#metadata-sampled").text(metadata.sampled);
                $("#metadata-sampled-count").text(metadata.sampledcount ? jlab.wave.util.intToStringWithCommas(metadata.sampledcount) : 'N/A');
                $("#metadata-stepped-count").text(metadata.steppedcount ? jlab.wave.util.intToStringWithCommas(metadata.steppedcount) : '');

                $("#statistics-popup h2").text(e.dataSeries.pv);
                $("#metadata-max").text(metadata.max ? jlab.wave.util.intToStringWithCommas(metadata.max) : '');
                $("#metadata-min").text(metadata.min ? jlab.wave.util.intToStringWithCommas(metadata.min) : '');
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
};



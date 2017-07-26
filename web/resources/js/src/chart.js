var jlab = jlab || {};
jlab.wave = jlab.wave || {};

/**
 * Constructor for Chart object. 
 * 
 * A wave Chart encapsulates a CanvasJS chart object, a reference to a 
 * placeholder div in the DOM, and an array of pv names.
 * 
 * @param {string array} pvs - The PV names
 * @param {boolean} separateYAxis - If multiple PVs should they have separate 
 * Y axis (otherwise share a single Y axis)
 * @returns {jlab.wave.Chart} - The chart
 */
jlab.wave.Chart = function (pvs, separateYAxis) {
    this.pvs = pvs.slice(); /* slice (not splice) makes a copy */
    this.canvasjsChart = null;
    this.$placeholderDiv = null; /*$ prefix since this is a jQuery object*/

    var chartId = 'chart-' + jlab.wave.chartIdSequence++,
            labels = [],
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

    for (var i = 0; i < this.pvs.length; i++) {
        var pv = this.pvs[i],
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

    var title = labels[0];

    for (var i = 1; i < labels.length; i++) {
        title = title + ", " + labels[i];
    }

    this.$placeholderDiv = $('<div id="' + chartId + '" class="chart"></div>');
    jlab.wave.chartHolder.append(this.$placeholderDiv);
    jlab.wave.charts.push(this);
    /*jlab.wave.idToChartMap[chartId] = this;*/
    var minDate = jlab.wave.startDateAndTime,
            maxDate = jlab.wave.endDateAndTime,
            timeInfo = new jlab.wave.TimeInfo(minDate, maxDate);

    this.canvasjsChart = new CanvasJS.Chart(chartId, {
        zoomEnabled: true,
        exportEnabled: true,
        rangeChanging: jlab.wave.zoomRangeChange,
        timeInfo: timeInfo,
        title: {
            text: timeInfo.title
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
                var series = jlab.wave.pvToSeriesMap[e.dataSeries.pv],
                        metadata = series.metadata;
                $("#metadata-datatype").text(metadata.datatype);
                $("#metadata-host").text(metadata.datahost);
                $("#metadata-count").text(metadata.count ? jlab.wave.intToStringWithCommas(metadata.count) : '');
                $("#metadata-sampled").text(metadata.sampled);
                $("#metadata-sampled-count").text(metadata.sampledcount ? jlab.wave.intToStringWithCommas(metadata.sampledcount) : 'N/A');
                $("#metadata-stepped-count").text(metadata.steppedcount ? jlab.wave.intToStringWithCommas(metadata.steppedcount) : '');

                $("#statistics-popup h2").text(e.dataSeries.pv);
                $("#metadata-max").text(metadata.max ? jlab.wave.intToStringWithCommas(metadata.max) : '');
                $("#metadata-min").text(metadata.min ? jlab.wave.intToStringWithCommas(metadata.min) : '');
                /*END PART THAT COULD BE DEFERRED*/

                $("#pv-panel").panel("open");
            },
            itemmouseover: function (e) {
                $(e.chart._canvasJSContainer).attr("title", "PV Menu");

                /*Sure would be nice to change style of label, but it is too slow since it renders entire chart again*/

                /*e.chart.legend.set("fontColor", 'white');
                 e.chart.legend.set("backgroundColor", 'black');
                 e.chart.legend.set("borderColor", 'gray');
                 e.chart.legend.set("borderThickness", 1);
                 e.chart.legend.set("fontStyle", 'italic');
                 e.chart.legend.set("fontWeight", 'bold');
                 console.time("legend render");
                 e.chart.render();
                 console.timeEnd("legend render");*/
            },
            itemmouseout: function (e) {
                $(e.chart._canvasJSContainer).removeAttr("title");
                /*e.chart.legend.set("fontColor", 'black');
                 e.chart.legend.set("backgroundColor", 'transparent');
                 e.chart.legend.set("borderColor", 'transparent');
                 e.chart.legend.set("borderThickness", 0);
                 e.chart.legend.set("fontStyle", 'normal');
                 e.chart.legend.set("fontWeight", 'normal'); 
                 e.chart.render();*/
            }
        },
        axisY: axisY,
        axisX: {
            labelAutoFit: true,
            labelWrap: false,
            /*labelMaxWidth: 200,*/
            tickLength: 20,
            valueFormatString: timeInfo.startingTickFormat,
            interval: timeInfo.startingInterval,
            intervalType: timeInfo.startingIntervalType,
            labelAngle: -45,
            minimum: minDate,
            maximum: maxDate
        },
        data: data
    });
};


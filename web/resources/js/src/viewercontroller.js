/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /*public wave viewer Enums*/
        wave.viewerModeEnum = Object.freeze({ARCHIVE: 1, STRIP: 2, WAVEFORM: 3});
        wave.multiplePvModeEnum = Object.freeze({SEPARATE_CHART: 1, SAME_CHART_SAME_AXIS: 2, SAME_CHART_SEPARATE_AXIS: 3});

        /*TODO: should these be private?*/
        wave.pvToSeriesMap = {};
        wave.pvs = [];
        wave.charts = [];
        wave.selectedSeries; /*When you click on series label in legend*/
        wave.startDateAndTime = new Date();
        wave.endDateAndTime = new Date(jlab.wave.startDateAndTime.getTime());

        /**
         * Constructor for ViewerController object. 
         * 
         * A wave ViewerController handles actions / state changes in the viewer.
         */
        wave.ViewerController = function () {

            let viewerMode = jlab.wave.viewerModeEnum.ARCHIVE;

            let multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART,
                    layoutManager = new jlab.wave.LayoutManager($("#chart-container"), multiplePvMode);

            const MAX_POINTS_PER_SERIES = 100000;
            const MAX_PVS = 5; /*Max Charts too*/

            /*http://colorbrewer2.org/#type=qualitative&scheme=Paired&n=5*/
            let colors = ['#33a02c', '#1f78b4', '#fb9a99', '#a6cee3', '#b2df8a']; /*Make sure at least as many as MAX_PVS*/

            /*WebSocket connection*/
            let con = null;

            this.getViewerMode = function () {
                return viewerMode;
            };

            this.setViewerMode = function (mode) {
                viewerMode = mode;

                console.log('set mode: ' + mode);

                if (viewerMode === jlab.wave.viewerModeEnum.STRIP) {
                    initStripchart();
                } else if (con !== null) {
                    con.clearPvs(jlab.wave.pvs);
                    con.autoReconnect = false;
                    con.close();
                    con = null;
                }
            };

            this.getMultiplePvMode = function () {
                return multiplePvMode;
            };

            this.setMultiplePvMode = function (mode) {
                multiplePvMode = mode;
                layoutManager = new jlab.wave.LayoutManager($("#chart-container"), multiplePvMode);
            };

            this.doLayout = function () {
                layoutManager.doLayout();
            };

            /* Sync zoom of all charts and update chart tick label format and tick interval */
            this.zoomRangeChange = function (e) {

                let viewportMinimum = e.axisX[0].viewportMinimum,
                        viewportMaximum = e.axisX[0].viewportMaximum,
                        timeFormatter = e.chart.options.timeFormatter;

                timeFormatter.adjustForViewportZoom(viewportMinimum, viewportMaximum);

                for (let i = 0; i < jlab.wave.charts.length; i++) {
                    let c = jlab.wave.charts[i].canvasjsChart;

                    if (!c.options.axisX) {
                        c.options.axisX = {};
                    }

                    if (e.trigger === "reset") {
                        c.options.axisX.viewportMinimum = c.options.axisX.viewportMaximum = null;

                        c.options.axisX.valueFormatString = timeFormatter.startingTickFormat;
                        c.options.axisX.interval = timeFormatter.startingInterval;
                        c.options.axisX.intervalType = timeFormatter.startingIntervalType;

                        if (c !== e.chart) {
                            c.render();
                        }
                    } else {
                        if (c !== e.chart) {
                            c.options.axisX.viewportMinimum = viewportMinimum;
                            c.options.axisX.viewportMaximum = viewportMaximum;
                        }

                        /*Don't update tick labels and interval for pan; only for zoom*/
                        if (e.trigger === "zoom") {
                            c.options.axisX.valueFormatString = timeFormatter.tickFormat;
                            c.options.axisX.interval = timeFormatter.interval;
                            c.options.axisX.intervalType = timeFormatter.intervalType;
                        }

                        if (c !== e.chart) {
                            c.render();
                        }
                    }
                }
            };
            let getData = function (pv, multiple) {
                /*In case things go wrong we set to empty*/
                let series = jlab.wave.pvToSeriesMap[pv];
                series.metadata = {};
                series.data = [];

                let url = '/myget/jmyapi-span-data',
                        data = {
                            c: pv,
                            b: jlab.wave.util.toIsoDateTimeString(jlab.wave.startDateAndTime),
                            e: jlab.wave.util.toIsoDateTimeString(jlab.wave.endDateAndTime),
                            t: '',
                            l: MAX_POINTS_PER_SERIES
                        },
                        dataType = "json",
                        options = {url: url, type: 'GET', data: data, dataType: dataType, timeout: 30000};

                if (!multiple) {
                    $.mobile.loading("show", {textVisible: true, theme: "b"});
                }

                options.beforeSend = function () {
                    console.time("fetch " + pv); /*This isn't perfect due to event queue running whenever*/
                };

                let promise = $.ajax(options);
                promise.done(function (json) {
                    console.timeEnd("fetch " + pv);
                    /*console.log(json);*/

                    if (typeof json.datatype === 'undefined') {
                        alert('PV ' + pv + ' not found');
                        return;
                    }

                    if (!(json.datatype === 'DBR_DOUBLE' || json.datatype === 'DBR_FLOAT' || json.datatype === 'DBR_SHORT' || json.datatype === 'DBR_LONG')) {
                        alert('datatype not a number: ' + json.datatype);
                        return;
                    }

                    if (json.datasize !== 1) { /*This check is probably unnecessary since only vectors are strings*/
                        alert('datasize not scalar: ' + json.datasize);
                        return;
                    }

                    let makeStepLine = true; /*Since we are using dashed line for sampled we probably should step line too*/

                    /*if (json.sampled === true) {
                     makeStepLine = false;
                     } else {
                     makeStepLine = true;
                     }*/

                    let formattedData = [],
                            prev = null,
                            minY = Number.POSITIVE_INFINITY,
                            maxY = Number.NEGATIVE_INFINITY;

                    if (makeStepLine) {
                        for (let i = 0; i < json.data.length; i++) {
                            let record = json.data[i],
                                    timestamp = record.d,
                                    value = parseFloat(record.v),
                                    point;

                            if (value < minY) {
                                minY = value;
                            }
                            if (value > maxY) {
                                maxY = value;
                            }

                            /*NaN is returned if not a number and NaN is the only thing that isn't equal itself so that is how we detect it*/
                            if (value !== value) {
                                formattedData.push({x: timestamp, y: null});
                                formattedData.push({x: timestamp, y: 0, markerType: 'triangle', markerColor: 'red', markerSize: 12, toolTipContent: "{x}, " + record.v});
                                point = {x: timestamp, y: null};
                            } else {
                                point = {x: timestamp, y: value};
                            }

                            if (prev !== null && prev === prev) { /*prev === prev skips NaN*/
                                formattedData.push({x: timestamp, y: prev});
                            }

                            formattedData.push(point);
                            prev = value;
                        }
                    } else { /*Don't step data*/
                        for (let i = 0; i < json.data.length; i++) {
                            let record = json.data[i],
                                    timestamp = record.d,
                                    value = parseFloat(record.v),
                                    point;

                            if (value < minY) {
                                minY = value;
                            }
                            if (value > maxY) {
                                maxY = value;
                            }

                            /*NaN is returned if not a number and NaN is the only thing that isn't equal itself so that is how we detect it*/
                            if (value !== value) {
                                formattedData.push({x: timestamp, y: null});
                                formattedData.push({x: timestamp, y: 0, markerType: 'triangle', markerColor: 'red', markerSize: 12, toolTipContent: "{x}, " + record.v});
                                point = {x: timestamp, y: null};
                            } else {
                                point = {x: timestamp, y: value};
                            }

                            formattedData.push(point);
                        }
                    }

                    series.metadata = {
                        datatype: json.datatype,
                        datasize: json.datasize,
                        datahost: json.datahost,
                        sampled: json.sampled,
                        count: json.count,
                        sampledcount: json.sampled ? json.data.length : 'N/A',
                        steppedcount: formattedData.length,
                        max: maxY,
                        min: minY
                    };

                    series.data = formattedData;

                    console.log('database event count: ' + jlab.wave.util.intToStringWithCommas(json.count));
                    console.log('transferred points: ' + jlab.wave.util.intToStringWithCommas(json.data.length));
                    console.log('total points (includes steps): ' + jlab.wave.util.intToStringWithCommas(formattedData.length));
                });
                promise.error(function (xhr, t, m) {
                    let json;
                    try {
                        if (t === "timeout") {
                            json = {error: 'Timeout while waiting for response'};
                        } else if (typeof xhr.responseText === 'undefined' || xhr.responseText === '') {
                            json = {};
                        } else {
                            json = $.parseJSON(xhr.responseText);
                        }
                    } catch (err) {
                        window.console && console.log('Response is not JSON: ' + xhr.responseText);
                        json = {};
                    }

                    let message = json.error || 'Server did not handle request';
                    alert('Unable to perform request: ' + message);
                });
                promise.always(function () {
                    /*Need to figure out how to include series in legend even if no data; until then we'll just always add a point if empty*/
                    if (series.data.length === 0) {
                        series.data = [{x: jlab.wave.startDateAndTime, y: 0, markerType: 'cross', markerColor: 'red', markerSize: 12, toolTipContent: pv + ": NO DATA"}];
                    }

                    if (!multiple) {
                        $.mobile.loading("hide");
                        layoutManager.doLayout();
                    }
                });
                return promise;
            };
            let addPv = function (pv) {
                if (jlab.wave.pvs.indexOf(pv) !== -1) {
                    alert('Already charting pv: ' + pv);
                    return;
                }

                if (jlab.wave.pvs.length + 1 > MAX_PVS) {
                    alert('Too many pvs; maximum number is: ' + MAX_PVS);
                    return;
                }

                jlab.wave.pvs.push(pv);

                jlab.wave.pvs.sort();

                console.log('adding pv: ' + pv);

                let series = new jlab.wave.Series(pv);

                jlab.wave.pvToSeriesMap[pv] = series;

                series.preferences = {
                    color: colors.shift()
                };

                $("#pv-input").val("");
                $("#chart-container").css("border", "none");
                let uri = new URI(),
                        queryMap = uri.query(true),
                        pvs = queryMap['pv'] || [],
                        addToUrl = false;
                if (!Array.isArray(pvs)) {
                    pvs = [pvs];
                }

                if ($.inArray(pv, pvs) === -1) {
                    addToUrl = true;
                }

                if (addToUrl) {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {pv: pv});
                    window.history.replaceState({}, 'Add pv: ' + pv, url);
                }
            };
            this.csvexport = function () {
                let data = '',
                        filename = 'chart.csv',
                        type = 'text/csv';

                /*TODO: figure out which chart is being export and only get pvs from it*/
                for (let i = 0; i < jlab.wave.pvs.length; i++) {
                    let pv = jlab.wave.pvs[i],
                            series = jlab.wave.pvToSeriesMap[pv],
                            d = series.data;

                    data = data + '--- ' + pv + ' ---\r\n';
                    for (let j = 0; j < d.length; j++) {
                        if (!(j % 2)) { /*Only output even to skip stepped points */
                            data = data + jlab.wave.util.toIsoDateTimeString(new Date(d[j].x)) + ',' + d[j].y + '\r\n';
                        }
                    }
                }

                let file = new Blob([data], {type: type});
                if (window.navigator.msSaveOrOpenBlob) // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                else { // Others
                    let a = document.createElement("a"),
                            url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 0);
                }
            };
            this.validateOptions = function () {
                /*Verify valid number*/
                if (jlab.wave.startDateAndTime.getTime() !== jlab.wave.startDateAndTime.getTime()) { /*Only NaN is not equal itself*/
                    jlab.wave.startDateAndTime = new Date();
                }

                /*Verify valid number*/
                if (jlab.wave.endDateAndTime.getTime() !== jlab.wave.endDateAndTime.getTime()) { /*Only NaN is not equal itself*/
                    jlab.wave.endDateAndTime = new Date();
                }

                /*Verify valid number*/
                if (multiplePvMode !== multiplePvMode) { /*Only NaN is not equal itself*/
                    multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART;
                }

                /*Verify valid number*/
                if (viewerMode !== viewerMode) { /*Only NaN is not equal itself*/
                    viewerMode = jlab.wave.viewerModeEnum.ARCHIVE;
                }
            };
            this.deletePvs = function (pvs) {
                let uri = new URI();

                /*Note: we require pvs != jlab.wave.pvs otherwise pvs.length is modified during iteration.  We ensure this by using jlab.wave.pvs.slice*/
                pvs = pvs.slice(); /* slice (not splice) makes a copy */

                for (let i = 0; i < pvs.length; i++) {
                    let pv = pvs[i],
                            series = jlab.wave.pvToSeriesMap[pv],
                            metadata = series.metadata,
                            color = metadata.color,
                            chart = series.chart,
                            index = chart.pvs.indexOf(pv);

                    chart.pvs.splice(index, 1);

                    if (chart.pvs.length < 1) {
                        jlab.wave.charts.splice(jlab.wave.charts.indexOf(chart), 1);
                        chart.$placeholderDiv.remove();
                        delete chart;
                    }

                    delete jlab.wave.pvToSeriesMap[pv];

                    let index2 = jlab.wave.pvs.indexOf(pv);
                    jlab.wave.pvs.splice(index2, 1);

                    /*Put color back in array for re-use*/
                    colors.push(color);

                    uri.removeQuery("pv", pv);
                }

                layoutManager.doLayout();

                if (Object.keys(jlab.wave.pvToSeriesMap).length === 0) {
                    $("#chart-container").css("border", "1px dashed black");
                }

                let url = uri.href();
                window.history.replaceState({}, 'Remove pvs: ' + pvs, url);
            };
            this.addPvs = function (pvs) {
                multiplePvAction(pvs, true);
            };
            this.refresh = function () {
                if (jlab.wave.controller.getViewerMode() === jlab.wave.viewerModeEnum.ARCHIVE) {
                    multiplePvAction(jlab.wave.pvs, false);
                } /*if STRIP the onopen callback will handle this*/
            };
            let addMonitor = function (pv) {
                con.monitorPvs([pv]);
            };
            let multiplePvAction = function (pvs, add) {
                if (pvs.length > 0) {
                    let action;

                    if (viewerMode === jlab.wave.viewerModeEnum.STRIP) {
                        action = addMonitor;
                    } else {
                        action = getData;
                    }

                    $.mobile.loading("show", {textVisible: true, theme: "b"});

                    let promises = [];

                    for (let i = 0; i < pvs.length; i++) {
                        let pv = pvs[i];

                        if (add) {
                            addPv(pv);
                        }

                        let promise = action(pv, true);

                        promises.push(promise);
                    }

                    $.whenAll.apply($, promises).always(function () {
                        $.mobile.loading("hide");
                        layoutManager.doLayout();
                    });
                }
            };

            let doStripchartUpdate = function (pv, point, lastUpdated) {
                let series = jlab.wave.pvToSeriesMap[pv];
                if (typeof series !== 'undefined') {
                    series.addSteppedPoint(point, lastUpdated);
                    series.lastUpdated = lastUpdated;
                    /*series.chart.canvasjsChart.options.data[0].dataPoints = series.data;*/
                    series.chart.canvasjsChart.render();
                } else {
                    console.log('server is updating me on a PV I am unaware of: ' + pv);
                }
            };

            let initStripchart = function () {
                let options = {};

                con = new jlab.epics2web.ClientConnection(options);

                con.onopen = function (e) {
                    if (jlab.wave.pvs.length > 0) {
                        jlab.wave.controller.addPvs(jlab.wave.pvs);
                    }
                };

                con.onupdate = function (e) {
                    doStripchartUpdate(e.detail.pv, e.detail.value * 1, e.detail.date);
                };

                con.oninfo = function (e) {
                    if (e.detail.connected) {
                        if (!jlab.epics2web.isNumericEpicsType(e.detail.datatype)) {
                            alert(e.detail.pv + ' values are not numeric: ' + e.detail.datatype);
                        }
                    } else {
                        alert('Could not connect to PV: ' + e.detail.pv);
                    }
                    console.log(e);
                };


                console.log('init');
                console.log(con);
            };
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));



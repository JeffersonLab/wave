/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /*public wave viewer Enums*/
        wave.viewerModeEnum = Object.freeze({ARCHIVE: 1, STRIP: 2, WAVEFORM: 3});
        wave.layoutModeEnum = Object.freeze({SEPARATE_CHART: 1, SAME_CHART_SAME_AXIS: 2, SAME_CHART_SEPARATE_AXIS: 3});

        /*TODO: should these be private?*/
        wave.pvToSeriesMap = {};
        wave.charts = [];
        wave.selectedSeries; /*When you click on series label in legend*/
        
        /*http://colorbrewer2.org/#type=qualitative&scheme=Paired&n=5*/
        /*One global set since viewer is destroyed on options update*/
        /*Make sure at least as many as MAX_PVS*/
        // wave.colors = ['#33a02c', '#1f78b4', '#fb9a99', '#a6cee3', '#b2df8a'];
        wave.colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a'];

        let Viewer = class Viewer {
            constructor(chartManager, layoutManager) {
                let _chartManager = chartManager;
                let _options = chartManager.getOptions();
                let _layoutManager = layoutManager;

                this.doLayout = function () {
                    _layoutManager.doLayout();
                };

                Viewer.prototype.addPv = function (pv) {
                    let series = new wave.Series(pv);

                    wave.pvToSeriesMap[pv] = series;

                    series.preferences.color = wave.colors.shift();
                };

                Viewer.prototype.addPvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        Viewer.prototype.addPv(pvs[i]);
                    }
                };

                this.removePvs = function (pvs) {
                    /*Note: we require pvs != ChartManager.pvs otherwise pvs.length is modified during iteration.  We ensure this by using slice*/
                    pvs = pvs.slice(); /* slice (not splice) makes a copy */

                    for (let i = 0; i < pvs.length; i++) {
                        let pv = pvs[i],
                                series = jlab.wave.pvToSeriesMap[pv],
                                preferences = series.preferences,
                                color = preferences.color,
                                chart = series.chart,
                                chartPvs = chart.getPvs(),
                                index = chartPvs.indexOf(pv);

                        chartPvs.splice(index, 1);

                        chart.setPvs(chartPvs);

                        if (chartPvs.length < 1) {
                            jlab.wave.charts.splice(jlab.wave.charts.indexOf(chart), 1);
                            chart.destroy();
                            delete series.chart;
                        }

                        delete jlab.wave.pvToSeriesMap[pv];

                        /*Put color back in array for re-use*/
                        wave.colors.push(color);
                    }

                    layoutManager.doLayout();
                };

                Viewer.prototype.destroy = function () {
                    // Do nothing
                };

                let getData = function (pv, multiple) {
                    /*In case things go wrong we set to empty*/
                    let series = jlab.wave.pvToSeriesMap[pv];
                    series.metadata = {};
                    series.data = [];
                    series.error = null; /*Reset error before each request*/

                    let url = '/myquery/interval',
                            data = {
                                c: pv,
                                b: jlab.wave.util.toIsoDateTimeString(_options.start),
                                e: jlab.wave.util.toIsoDateTimeString(_options.end),
                                u: '',
                                m: _options.myaDeployment,
                                l: _options.myaLimit
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
                                    let pvLabel = pv;
                                    if (json.sampled) {
                                        pvLabel = pv + " (sampled)";
                                    }
                                    formattedData.push({x: timestamp, y: 0, markerType: 'triangle', markerColor: 'red', markerSize: 12, toolTipContent: pvLabel + "<br/>{x}<br/><b>" + record.t + "</b>"});
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
                                    formattedData.push({x: timestamp, y: 0, markerType: 'triangle', markerColor: 'red', markerSize: 12, toolTipContent: "{x}, " + record.x});
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

                        if (typeof json.count !== "undefined" && json.count !== null) {
                            console.log('database event count: ' + jlab.wave.util.intToStringWithCommas(json.count));
                        }
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

                        // noinspection UnnecessaryLocalVariableJS
                        let message = json.error || 'Server did not handle request';
                        /*alert('Unable to perform request: ' + message);*/
                        series.error = message;
                    });
                    promise.always(function () {
                        /*Need to figure out how to include series in legend even if no data; until then we'll just always add a point if empty*/
                        if (series.data.length === 0) {
                            series.data = [{x: _options.start, y: 0, markerType: 'cross', markerColor: 'red', markerSize: 12, toolTipContent: pv + ": NO DATA"}];
                            if (series.error === null) {
                                series.error = "No Data";
                            }
                        }

                        if (!multiple) {
                            $.mobile.loading("hide");
                            layoutManager.doLayout();
                        }
                    });
                    return promise;
                };
                this.fetchMultiple = function (pvs) {
                    if (pvs.length > 0) {
                        $.mobile.loading("show", {textVisible: true, theme: "b"});

                        let promises = [];

                        for (let i = 0; i < pvs.length; i++) {
                            let pv = pvs[i];

                            let promise = getData(pv, true);

                            promises.push(promise);
                        }

                        $.whenAll.apply($, promises).always(function () {
                            $.mobile.loading("hide");
                            _layoutManager.doLayout();
                        });
                    }
                };

                Viewer.prototype.refresh = function () {
                    // Archive will fetchMultiple, Strip does nothing.
                };
            }
        };
        
        wave.ArchiveViewer = class ArchiveViewer extends Viewer {
            constructor(chartManager, layoutManager) {
                super(chartManager, layoutManager);

                wave.ArchiveViewer.prototype.addPvs = function (pvs) {
                    Viewer.prototype.addPvs(pvs);

                    this.fetchMultiple(pvs);
                };

                wave.ArchiveViewer.prototype.refresh = function () {
                    Viewer.prototype.refresh();

                    this.fetchMultiple(chartManager.getPvs(), false);
                };
            }
        };

        wave.StripViewer = class StripViewer extends Viewer {
            constructor(chartManager, layoutManager) {
                super(chartManager, layoutManager);

                /*WebSocket connection*/
                let con = null;

                let self = this;

                wave.StripViewer.prototype.addPvs = function (pvs) {
                    Viewer.prototype.addPvs(pvs);

                    self.doLayout();

                    con.monitorPvs(pvs);
                };

                let doStripchartUpdate = function (pv, point, lastUpdated) {
                    /*console.log('strip update: ' + pv);
                     console.log(wave.pvToSeriesMap[pv]);*/
                    let series = wave.pvToSeriesMap[pv];
                    if (typeof series !== 'undefined') {
                        series.lastUpdated = lastUpdated;
                        series.addSteppedPoint(point, lastUpdated);

                        let keys = Object.keys(wave.pvToSeriesMap);
                        for (let i = 0; i < keys.length; i++) {
                            let pv = keys[i];
                            let other = wave.pvToSeriesMap[pv];
                            if (other.pv !== series.pv) {
                                other.lastUpdated = lastUpdated;
                                other.addExtensionPoint(lastUpdated);
                            }
                        }

                    } else {
                        console.log('server is updating me on a PV I am unaware of: ' + pv);
                    }
                };


                let _conOpts = {};

                con = new jlab.epics2web.ClientConnection(_conOpts);

                con.onopen = function (e) {
                    if (chartManager.getPvs().length > 0) {
                        self.addPvs(chartManager.getPvs());
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

                        let series = wave.pvToSeriesMap[e.detail.pv];

                        series.metadata = {datatype: e.detail.datatype, datahost: "", count: null, sampled: false, sampledcount: null, steppedcount: null};
                    } else {
                        alert('Could not connect to PV: ' + e.detail.pv);
                    }
                    /*console.log(e);*/
                };


                /*console.log('init');
                 console.log(con);*/


                Viewer.prototype.destroy = function () {
                    console.log('destroy');
                    if (con !== null) {
                        con.clearPvs(chartManager.getPvs());
                        con.autoReconnect = false;
                        con.close();
                        con = null;
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));



/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.ChartManager = class ChartManager {

            constructor(options, pvs) {
                let _options = options;

                let self = this; /*private functions don't see this as expected*/

                _options.validate();

                this.getOptions = function () {
                    return $.extend(true, {}, _options); /*Return a clone to ensure immutability*/
                };

                // const MAX_POINTS_PER_SERIES = 100000;
                // const MAX_PVS = 5; /*Max Charts too*/
                const MAX_PVS = 10; /*Max Charts too*/

                let _pvs = pvs || [];

                let addPv = function (pv) {
                    if (_pvs.indexOf(pv) !== -1) {
                        throw ('Already charting pv: ' + pv);
                    }

                    if (_pvs.length + 1 > MAX_PVS) {
                        throw ('Too many pvs; maximum number is: ' + MAX_PVS);
                    }

                    _pvs.push(pv);

                    _pvs.sort();
                };

                this.addPvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        addPv(pvs[i]);
                    }

                    _viewer.addPvs(pvs);
                };

                this.removePvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        let j = _pvs.indexOf(pvs[i]);
                        _pvs.splice(j, 1);
                    }

                    _viewer.removePvs(pvs);
                };

                this.getPvs = function () {
                    return _pvs.slice(0); /*Return a copy since array is mutable*/
                };

                let _layoutManager;

                let updateLayoutManager = function () {
                    if (_options.layoutMode === wave.layoutModeEnum.SEPARATE_CHART) {
                        _layoutManager = new wave.SeparateChartLayoutManager(self);
                    } else {
                        _layoutManager = new wave.SingleChartLayoutManager(self);
                    }
                };

                updateLayoutManager(); /*call function immediately*/

                let _viewer;

                let updateViewer = function () {
                    if (_viewer) {
                        _viewer.destroy();
                    }

                    if (_options.viewerMode === wave.viewerModeEnum.STRIP) {
                        _viewer = new wave.StripViewer(self, _layoutManager);
                    } else {
                        _viewer = new wave.ArchiveViewer(self, _layoutManager);
                    }
                };

                updateViewer(); /*call function immediately*/

                this.setOptions = function (options) {
                    let _old = $.extend(true, {}, _options),
                            fetchRequired = false;

                    _options = options;

                    _options.validate();

                    updateLayoutManager();
                    updateViewer();

                    if (_options.viewerMode !== _old.viewerMode) {
                        fetchRequired = true;
                    }

                    // If user has requested a new deployment, then request all of the data again
                    if (_old.myaDeployment !== _options.myaDeployment) {
                        fetchRequired = true;
                    }

                    // If user has requested a different sampling threshold, then request all of the data again
                    if (_old.myaLimit !== _options.myaLimit) {
                        fetchRequired = true;
                    }

                    if (_old.start.getTime() !== _options.start.getTime() || _old.end.getTime() !== _options.end.getTime()) {
                        fetchRequired = true;
                    }

                    if (fetchRequired) {
                        _viewer.refresh();
                    } else {
                        _viewer.doLayout();
                    }
                };

                if (_options.viewerMode === wave.viewerModeEnum.ARCHIVE) {
                    _viewer.addPvs(_pvs);
                } /*if STRIP the onopen callback will handle this*/

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
                this.csvexport = function () {
                    let data = '',
                            filename = 'chart.csv',
                            type = 'text/csv';

                    /*TODO: figure out which chart is being exported and only get pvs from it*/
                    for (let i = 0; i < _pvs.length; i++) {
                        let pv = _pvs[i],
                                series = jlab.wave.pvToSeriesMap[pv],
                                d = series.data;

                        data = data + '--- ' + pv + ' ---\r\n';
                        for (let j = 0; j < d.length; j++) {
                            if (!(j % 2)) { /*Only output even to skip stepped points */
                                data = data + wave.util.toIsoDateTimeString(new Date(d[j].x)) + ',' + d[j].y + '\r\n';
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

                /*Don't register resize event until after page load*/
                $(window).on("resize", function () {
                    console.log("window resize");
                    _viewer.doLayout();
                });
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
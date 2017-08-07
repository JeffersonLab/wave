/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {

        /* JQUERY / JQUERY MOBILE 'READY' EVENT */

        $(document).on("pagecontainerchange", function () {
            /* We wrap in jQuery ready function since we want BOTH jquery mobile to be fully transitioned AND the DOM fully loaded*/
            $(function () {
                let _urlManager = new jlab.wave.UrlManager(); /*Manage URL Parameters*/
                let _chartManager = new wave.ChartManager(_urlManager.getOptions(), _urlManager.getPvs()); /*Manage Chart Viewer*/
                new wave.GuiManager(_chartManager, _urlManager); /*Manage GUI*/
            });
        });

        wave.ApplicationOptions = class ApplicationOptions {
            constructor() {
                this.viewerMode = wave.viewerModeEnum.ARCHIVE;
                this.layoutMode = wave.layoutModeEnum.SEPARATE_CHART;
                this.start = new Date();
                this.end = this.start;

                this.end.setMinutes(this.start.getMinutes() - 5);

                this.$chartSetDiv = $("#chart-container");

                this.validate = function () {
                    /*Verify valid number*/
                    if (this.start.getTime() !== this.start.getTime()) { /*Only NaN is not equal itself*/
                        this.start = new Date();
                    }

                    /*Verify valid number*/
                    if (this.end.getTime() !== this.end.getTime()) { /*Only NaN is not equal itself*/
                        this.end = new Date();
                    }

                    /*Verify valid number*/
                    if (this.layoutMode !== this.layoutMode) { /*Only NaN is not equal itself*/
                        this.layoutMode = wave.layoutModeEnum.SEPARATE_CHART;
                    }

                    /*Verify valid number*/
                    if (this.viewerMode !== this.viewerMode) { /*Only NaN is not equal itself*/
                        this.viewerMode = wave.viewerModeEnum.ARCHIVE;
                    }
                };
            }
        };

        wave.GuiManager = class GuiManager {
            constructor(chartManager, urlManager) {
                let _chartManager = chartManager;
                let _urlManager = urlManager;

                let addPvs = function (pvs) {
                    $("#pv-input").val("");
                    $("#chart-container").css("border", "none");

                    _urlManager.addPvs(pvs);
                    _chartManager.addPvs(pvs);
                };

                /* JQUERY MOBILE GLOBAL TOOLBAR INIT */
                $("#header-panel").toolbar({theme: "a", tapToggle: false});
                $("#footer-panel").toolbar({theme: "a", tapToggle: false});
                $.mobile.resetActivePageHeight();

                /* DATEBOX DATE-TIME PICKER INIT */
                jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
                    'maxDur': 86399,
                    'lockInput': false
                });

                if (jlab.wave.util.hasTouch()) {
                    $("#start-date-input").datebox({mode: "flipbox"});
                    $("#start-time-input").datebox({mode: "durationflipbox", overrideSetDurationButtonLabel: "Set Time", overrideDurationLabel: ["Day", "Hour", "Minute", "Second"], overrideDurationFormat: "%Dl:%DM:%DS", overrideDurationOrder: ['h', 'i', 's']});
                    $("#end-date-input").datebox({mode: "flipbox"});
                    $("#end-time-input").datebox({mode: "durationflipbox", overrideSetDurationButtonLabel: "Set Time", overrideDurationLabel: ["Day", "Hour", "Minute", "Second"], overrideDurationFormat: "%Dl:%DM:%DS", overrideDurationOrder: ['h', 'i', 's']});
                } else {
                    $("#start-date-input").datebox({mode: "calbox"});
                    $("#start-time-input").datebox({mode: "durationbox", overrideSetDurationButtonLabel: "Set Time", overrideDurationLabel: ["Day", "Hour", "Minute", "Second"], overrideDurationFormat: "%Dl:%DM:%DS", overrideDurationOrder: ['h', 'i', 's']});
                    $("#end-date-input").datebox({mode: "calbox"});
                    $("#end-time-input").datebox({mode: "durationbox", overrideSetDurationButtonLabel: "Set Time", overrideDurationLabel: ["Day", "Hour", "Minute", "Second"], overrideDurationFormat: "%Dl:%DM:%DS", overrideDurationOrder: ['h', 'i', 's']});
                }

                /* --- EVENT WIRING --- */

                /* MOUSE EVENTS */

                $(document).on("click", "#pv-info-list a", function () {
                    $("#pv-panel").panel("close");
                });
                $(document).on("click", "#options-button", function () {
                    $("#options-panel").panel("open");
                });
                $(document).on("click", ".cancel-panel-button", function () {
                    $(this).closest(".ui-panel").panel("close");
                    return false;
                });
                $(document).on("click", "#update-options-button", function () {

                    let fetchRequired = false,
                            _options = _chartManager.getOptions(),
                            oldStartMillis = _options.start.getTime(),
                            oldEndMillis = _options.end.getTime(),
                            startDateStr = $("#start-date-input").val(),
                            startTimeStr = $("#start-time-input").val(),
                            endDateStr = $("#end-date-input").val(),
                            endTimeStr = $("#end-time-input").val(),
                            startDate = jlab.wave.util.parseUserDate(startDateStr),
                            startTime = jlab.wave.util.parseUserTime(startTimeStr),
                            endDate = jlab.wave.util.parseUserDate(endDateStr),
                            endTime = jlab.wave.util.parseUserTime(endTimeStr);

                    _options.start.setFullYear(startDate.getFullYear());
                    _options.start.setMonth(startDate.getMonth());
                    _options.start.setDate(startDate.getDate());
                    _options.start.setHours(startTime.getHours());
                    _options.start.setMinutes(startTime.getMinutes());
                    _options.start.setSeconds(startTime.getSeconds());
                    _options.end.setFullYear(endDate.getFullYear());
                    _options.end.setMonth(endDate.getMonth());
                    _options.end.setDate(endDate.getDate());
                    _options.end.setHours(endTime.getHours());
                    _options.end.setMinutes(endTime.getMinutes());
                    _options.end.setSeconds(endTime.getSeconds());

                    _options.layoutMode = parseInt($("#multiple-pv-mode-select").val());

                    _options.validate();

                    let uri = new URI();
                    uri.setQuery("start", wave.util.toIsoDateTimeString(_options.start));
                    uri.setQuery("end", wave.util.toIsoDateTimeString(_options.end));
                    uri.setQuery("layoutMode", _options.layoutMode);
                    uri.setQuery("viewerMode", _options.viewerMode);
                    window.history.replaceState({}, 'Set start and end', uri.href());

                    _chartManager.setOptions(_options);

                    $("#options-panel").panel("close");
                });
                $(document).on("click", "#pv-visibility-toggle-button", function () {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                            e.dataSeries.visible = false;
                            $("#pv-visibility-toggle-button").text("Show");
                        } else {
                            e.dataSeries.visible = true;
                            $("#pv-visibility-toggle-button").text("Hide");
                        }

                        e.chart.render();
                    }

                    $("#pv-panel").panel("close");
                });
                $(document).on("click", "#pv-delete-button", function () {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        _chartManager.removePvs([e.dataSeries.pv]);
                        $("#pv-panel").panel("close");

                    }
                });

                /* KEYBOARD EVENTS */

                $(document).on("keyup", "#pv-input", function (e) {
                    if (e.keyCode === 13) {
                        let input = $.trim($("#pv-input").val());
                        if (input !== '') {
                            /*Replace all commas with space, split on any whitespace, filter out empty strings*/
                            let tokens = input.replace(new RegExp(',', 'g'), " ").split(/\s/).filter(Boolean);

                            addPvs(tokens);
                        }
                        return false; /*Don't do default action*/
                    }
                });

                /* JQUERY MOBILE UI EVENTS */

                $(document).on("panelbeforeopen", "#options-panel", function () {
                    $("#start-date-input").val(wave.util.toUserDateString(_chartManager.getOptions().start));
                    $("#start-time-input").val(wave.util.toUserTimeString(_chartManager.getOptions().start));
                    $("#end-date-input").val(wave.util.toUserDateString(_chartManager.getOptions().end));
                    $("#end-time-input").val(wave.util.toUserTimeString(_chartManager.getOptions().end));
                    $("#multiple-pv-mode-select").val(_chartManager.getOptions().layoutMode).change();
                    $("#viewer-mode-select").val(_chartManager.getOptions().viewerMode).change();
                });

                /* DATEBOX EVENTS */

                /*I want button on right so this is a hack to switch it on pop-up 'open' - todo: just change the damn source code of 3rd-party lib*/
                $(document).on('datebox', function (e, passed) {
                    if (passed.method === 'open') {
                        $(".ui-datebox-container .ui-btn-left").removeClass("ui-btn-left").addClass("ui-btn-right");
                    }
                });
            }
        };

        wave.UrlManager = class UrlManager {
            constructor() {
                let _options = new wave.ApplicationOptions();

                this.getOptions = function () {
                    return _options;
                };

                /*Start parsing*/
                let uri = new URI(),
                        queryMap = uri.query(true);
                if (uri.hasQuery("start")) {
                    _options.start = wave.util.parseIsoDateTimeString(queryMap["start"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: wave.util.toIsoDateTimeString(_options.start)});
                    window.history.replaceState({}, 'Set start: ' + _options.start, url);
                }

                if (uri.hasQuery("end")) {
                    _options.end = wave.util.parseIsoDateTimeString(queryMap["end"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: wave.util.toIsoDateTimeString(_options.end)});
                    window.history.replaceState({}, 'Set end: ' + _options.end, url);
                }

                if (uri.hasQuery("layoutMode")) {
                    _options.layoutMode = parseInt(queryMap["layoutMode"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {layoutMode: _options.layoutMode});
                    window.history.replaceState({}, 'Set multiple PV Mode: ' + _options.layoutMode, url);
                }

                if (uri.hasQuery("viewerMode")) {
                    _options.viewerMode = parseInt(queryMap["viewerMode"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {viewerMode: _options.viewerMode});
                    window.history.replaceState({}, 'Set viewer Mode: ' + _options.viewerMode, url);
                }

                let _pvs = queryMap["pv"] || [];
                if (!Array.isArray(_pvs)) {
                    _pvs = [_pvs];
                }

                this.getPvs = function () {
                    return _pvs;
                };

                let addPv = function (pv) {
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

                this.addPvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        addPv(pvs[i]);
                    }
                };
            }
        };

        wave.ChartManager = class ChartManager {

            constructor(options, pvs) {
                let _options = options;

                let self = this; /*private functions don't see this as expected*/

                _options.validate();

                this.getOptions = function () {
                    return _options;
                };

                this.setOptions = function (options) {
                    let _old = _options,
                            fetchRequired = false;

                    _options = options;

                    _options.validate();

                    updateLayoutManager();
                    updateViewer();

                    if (_options.viewerMode !== _old.viewerMode) {
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

                const MAX_POINTS_PER_SERIES = 100000;
                const MAX_PVS = 5; /*Max Charts too*/

                let _pvs = pvs || [];

                let addPv = function (pv) {
                    if (_pvs.indexOf(pv) !== -1) {
                        alert('Already charting pv: ' + pv);
                        return;
                    }

                    if (_pvs.length + 1 > MAX_PVS) {
                        alert('Too many pvs; maximum number is: ' + MAX_PVS);
                        return;
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
                    console.log(_options.layoutMode);
                    if (_options.layoutMode === wave.layoutModeEnum.SEPARATE_CHART) {
                        console.log('multiple');
                        _layoutManager = new wave.SeparateChartLayoutManager(self);
                    } else {
                        console.log('single');
                        _layoutManager = new wave.SingleChartLayoutManager(self);
                    }
                }();

                /*updateLayoutManager();*/
                console.log(_layoutManager);

                let _viewer;

                let updateViewer = function () {
                    if (_viewer) {
                        _viewer.destroy();
                    }

                    if (_options.viewerMode === wave.viewerModeEnum.STRIP) {
                        _viewer = new wave.StripViewer(_options, _layoutManger);
                    } else {
                        _viewer = new wave.ArchiveViewer(_options, _layoutManager);
                    }
                }(); /*call function immediately*/

                if (_options.viewerMode === wave.viewerModeEnum.ARCHIVE) {
                    _viewer.addPvs(_pvs);
                } /*if STRIP the onopen callback will handle this*/

                /*Don't register resize event until after page load*/
                $(window).on("resize", function () {
                    console.log("window resize");
                    _viewer.doLayout();
                });
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
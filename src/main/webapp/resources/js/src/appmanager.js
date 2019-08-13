/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /**
         * Manage WAVE application and handles user input and GUI menus.  
         * Delegates to the UrlManager and ChartManager.
         */
        wave.AppManager = class AppManager {
            constructor() {
                let _urlManager = new jlab.wave.UrlManager(); /*Manage URL Parameters*/
                let _chartManager = new jlab.wave.ChartManager(_urlManager.getOptions(), _urlManager.getPvs(), _urlManager.getPreferences()); /*Manage Chart Viewer*/

                let guiAddPvs = function (pvs) {
                    $("#pv-input").val("");

                    if (pvs.length > 0) {
                        _chartManager.getOptions().$chartSetDiv.css("border", "none");
                    }
                };

                guiAddPvs(_urlManager.getPvs());

                let addPvs = function (pvs) {
                    _chartManager.addPvs(pvs);
                    guiAddPvs(pvs);
                    _urlManager.addPvs(pvs);
                };

                let removePvs = function (pvs) {
                    if (Object.keys(jlab.wave.pvToSeriesMap).length === 0) {
                        _chartManager.getOptions().$chartSetDiv.css("border", "1px dashed black");
                    }

                    _urlManager.removePvs(pvs);
                    _chartManager.removePvs(pvs);
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
                    $("#start-time-input").datebox({
                        mode: "durationflipbox",
                        overrideSetDurationButtonLabel: "Set Time",
                        overrideDurationLabel: ["Day", "Hour", "Minute", "Second"],
                        overrideDurationFormat: "%Dl:%DM:%DS",
                        overrideDurationOrder: ['h', 'i', 's']
                    });
                    $("#end-date-input").datebox({mode: "flipbox"});
                    $("#end-time-input").datebox({
                        mode: "durationflipbox",
                        overrideSetDurationButtonLabel: "Set Time",
                        overrideDurationLabel: ["Day", "Hour", "Minute", "Second"],
                        overrideDurationFormat: "%Dl:%DM:%DS",
                        overrideDurationOrder: ['h', 'i', 's']
                    });
                } else {
                    $("#start-date-input").datebox({mode: "calbox"});
                    $("#start-time-input").datebox({
                        mode: "durationbox",
                        overrideSetDurationButtonLabel: "Set Time",
                        overrideDurationLabel: ["Day", "Hour", "Minute", "Second"],
                        overrideDurationFormat: "%Dl:%DM:%DS",
                        overrideDurationOrder: ['h', 'i', 's']
                    });
                    $("#end-date-input").datebox({mode: "calbox"});
                    $("#end-time-input").datebox({
                        mode: "durationbox",
                        overrideSetDurationButtonLabel: "Set Time",
                        overrideDurationLabel: ["Day", "Hour", "Minute", "Second"],
                        overrideDurationFormat: "%Dl:%DM:%DS",
                        overrideDurationOrder: ['h', 'i', 's']
                    });
                }

                /* --- EVENT WIRING --- */

                /* MOUSE EVENTS */

                function toggleFullscreen() {
                    $("#header-panel").toggle();
                    $("#footer-panel").toggle();
                    $("#chart-container").toggleClass("fullscreen");
                    $("#fullscreen-link").toggleClass("ui-icon-carat-u ui-icon-carat-d");
                    $("#chart-page").toggleClass("no-padding");

                    $.mobile.resetActivePageHeight();
                }

                $(document).on("click", "#fullscreen-link", function () {
                    toggleFullscreen();

                    let fullscreen = $("#chart-container").hasClass("fullscreen");
                    _chartManager.getOptions().fullscreen = fullscreen;
                    let uri = new URI();
                    uri.setQuery("fullscreen", fullscreen);
                    window.history.replaceState({}, 'Set Fullscreen', uri.href());

                    _chartManager.refresh();

                    return false;
                });

                $(function () {
                    if (_chartManager.getOptions().fullscreen === 'true') {
                        toggleFullscreen();
                    }
                });


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
                            _options = new wave.ApplicationOptions(),
                            startDateStr = $("#start-date-input").val(),
                            startTimeStr = $("#start-time-input").val(),
                            endDateStr = $("#end-date-input").val(),
                            endTimeStr = $("#end-time-input").val(),
                            startDate = wave.util.parseUserDate(startDateStr),
                            startTime = wave.util.parseUserTime(startTimeStr),
                            endDate = wave.util.parseUserDate(endDateStr),
                            endTime = wave.util.parseUserTime(endTimeStr),
                            myaDeployment = $("#mya-deployment").val(),
                            myaLimit = $("#mya-limit").val(),
                            title = $("#chart-title-input").val();

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

                    _options.layoutMode = parseInt($("#layout-mode-select").val());

                    _options.viewerMode = parseInt($("#viewer-mode-select").val());
                    _options.myaDeployment = myaDeployment;
                    _options.myaLimit = myaLimit;
                    _options.title = title;

                    _options.validate();

                    let uri = new URI();
                    uri.setQuery("start", wave.util.toIsoDateTimeString(_options.start));
                    uri.setQuery("end", wave.util.toIsoDateTimeString(_options.end));
                    uri.setQuery("layoutMode", _options.layoutMode);
                    uri.setQuery("viewerMode", _options.viewerMode);
                    uri.setQuery("myaDeployment", _options.myaDeployment);
                    uri.setQuery("myaLimit", _options.myaLimit);
                    uri.setQuery("title", _options.title);
                    window.history.replaceState({}, 'Set Options', uri.href());

                    _chartManager.setOptions(_options);

                    $("#options-panel").panel("close");
                });
                $(document).on("click", "#pv-update-config-button", function () {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        let label = $("#pv-label").val();
                        let color = $("#pv-color").val();
                        let yAxisLabel = $("#pv-y-axis-label").val();

                        e.dataSeries.legendText = label;
                        e.dataSeries.color = color;
                        e.chart.axisY[e.dataSeries.axisYIndex].options.title = yAxisLabel;

                        let series = wave.pvToSeriesMap[e.dataSeries.pv];

                        series.preferences.label = label;
                        series.preferences.color = color;
                        series.preferences.yAxisLabel = yAxisLabel;

                        let uri = new URI();
                        uri.setQuery(e.dataSeries.pv + "label", label);
                        uri.setQuery(e.dataSeries.pv + "color", color);
                        uri.setQuery(e.dataSeries.pv + "yAxisLabel", yAxisLabel);
                        window.history.replaceState({}, 'Set PV Config', uri.href());

                        _chartManager.refresh();
                    }

                    $("#pv-panel").panel("close");
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
                        removePvs([e.dataSeries.pv]);
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

                            try {
                                addPvs(tokens);
                            } catch (e) {
                                console.log(e);
                                alert(e);
                            }
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
                    $("#layout-mode-select").val(_chartManager.getOptions().layoutMode).change();
                    $("#viewer-mode-select").val(_chartManager.getOptions().viewerMode).change();
                    $("#mya-deployment").val(_chartManager.getOptions().myaDeployment);
                    $("#mya-limit").val(_chartManager.getOptions().myaLimit);
                    $("#chart-title-input").val(_chartManager.getOptions().title);
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
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
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

                let getPvConfigUpdateValues = function() {
                    return {label: $("#pv-label").val(),
                            color: $("#pv-color").val(),
                            yAxisLabel: $("#pv-y-axis-label").val(),
                            yAxisMin: $("#pv-y-axis-min").val(),
                            yAxisMax: $("#pv-y-axis-max").val(),
                            yAxisLog: $("#pv-y-axis-log").is(":checked") ? true : null,
                            scaler: $("#pv-scaler").val()}
                };

                let setPvConfigValues = function(updates) {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        let series = wave.pvToSeriesMap[e.dataSeries.pv];

                        series.preferences.label = updates.label;
                        series.preferences.color = updates.color;
                        series.preferences.yAxisLabel = updates.yAxisLabel;
                        series.preferences.yAxisMin = updates.yAxisMin;
                        series.preferences.yAxisMax = updates.yAxisMax;
                        series.preferences.yAxisLog = updates.yAxisLog;
                        series.preferences.scaler = updates.scaler;

                        let uri = new URI();
                        uri.setQuery(e.dataSeries.pv + "label", updates.label);
                        uri.setQuery(e.dataSeries.pv + "color", updates.color);
                        uri.setQuery(e.dataSeries.pv + "yAxisLabel", updates.yAxisLabel);
                        uri.setQuery(e.dataSeries.pv + "yAxisMin", updates.yAxisMin);
                        uri.setQuery(e.dataSeries.pv + "yAxisMax", updates.yAxisMax);
                        uri.setQuery(e.dataSeries.pv + "yAxisLog", updates.yAxisLog);
                        uri.setQuery(e.dataSeries.pv + "scaler", updates.scaler);
                        window.history.replaceState({}, 'Set PV Config', uri.href());
                    }
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

                    _chartManager.doLayout();

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
                            sd = wave.util.parseUserDate(startDateStr),
                            st = wave.util.parseUserTime(startTimeStr),
                            ed = wave.util.parseUserDate(endDateStr),
                            et = wave.util.parseUserTime(endTimeStr),
                            myaDeployment = $("#mya-deployment").val(),
                            myaLimit = $("#mya-limit").val(),
                            liveWindowMinutes = $("#live-window-minutes").val(),
                            title = $("#chart-title-input").val();

                    let s = luxon.DateTime.local(sd.year, sd.month, sd.day, st.hour, st.minute, st.second, 0, {zone: 'America/New_York'});
                    let e = luxon.DateTime.local(ed.year, ed.month, ed.day, et.hour, et.minute, et.second, 0, {zone: 'America/New_York'});

                    _options.start = s;
                    _options.end = e;

                    _options.layoutMode = parseInt($("#layout-mode-select").val());

                    _options.viewerMode = parseInt($("#viewer-mode-select").val());
                    _options.myaDeployment = myaDeployment;
                    _options.myaLimit = myaLimit;
                    _options.liveWindowMinutes = liveWindowMinutes;
                    _options.title = title;

                    _options.validate();

                    let uri = new URI();
                    uri.setQuery("start", wave.util.toIsoDateTimeString(_options.start));
                    uri.setQuery("end", wave.util.toIsoDateTimeString(_options.end));
                    uri.setQuery("layoutMode", _options.layoutMode);
                    uri.setQuery("viewerMode", _options.viewerMode);
                    uri.setQuery("myaDeployment", _options.myaDeployment);
                    uri.setQuery("myaLimit", _options.myaLimit);
                    uri.setQuery("windowMinutes", _options.liveWindowMinutes);
                    uri.setQuery("title", _options.title);
                    window.history.replaceState({}, 'Set Options', uri.href());

                    _chartManager.setOptions(_options);

                    $("#options-panel").panel("close");
                });
                $(document).on("click", "#pv-update-config-button", function () {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        let updates = getPvConfigUpdateValues();

                        /*e.dataSeries.legendText = label;
                        e.dataSeries.color = color;
                        e.chart.axisY[e.dataSeries.axisYIndex].options.title = yAxisLabel;*/

                        let series = wave.pvToSeriesMap[e.dataSeries.pv];

                        let fetchRequired = false;
                        if(series.preferences.scaler !== updates.scaler) {
                            fetchRequired = true;
                        }

                        setPvConfigValues(updates);

                        if(fetchRequired) {
                            _chartManager.refresh();
                        } else {
                            _chartManager.doLayout();
                        }
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
                $(document).on("click", "#pv-move-to-top-button", function () {
                    let e = wave.selectedSeries;

                    if (typeof wave.selectedSeries !== 'undefined') {
                        let updates = getPvConfigUpdateValues();
                        let pv = e.dataSeries.pv;
                        removePvs([pv]);
                        addPvs([pv]);
                        setPvConfigValues(updates);

                        location.reload();
                    }
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

                $(document).on("filterablebeforefilter", "#pv-filter", function(e, data) {
                    e.preventDefault();

                    var $ul = $( this ),
                        $input = $( data.input ),
                        value = $input.val(),
                        html = "";

                    $ul.html( "" );

                    if ( value && value.length > 2 ) {
                        $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
                        $ul.listview( "refresh" );

                        let host = jlab.myqueryHost || window.location.host,
                            url = '//' + host + '/myquery/channel',
                            data = {
                                q: $input.val() + '%',
                                m: _chartManager.getOptions().myaDeployment
                            };

                        $.ajax({
                            url: url,
                            /*dataType: "jsonp",
                            crossDomain: true,*/
                            data: data
                        }).then( function ( response ) {
                                $.each( response, function ( i, val ) {
                                    html += '<li><a href="#">' + val.name + "</a></li>";
                                });
                                $ul.html( html );
                                $ul.listview("refresh");
                                $ul.find('li').removeClass("ui-screen-hidden");
                                $ul.trigger( "updatelayout");
                            });
                    }
                });

                $(document).on("click", "#pv-filter a", function(e) {
                    var pv = $(this).text(),
                        $ul = $("#pv-filter");
                    $("#pv-input").val("");
                    $ul.html("");
                    $ul.listview("refresh");
                    try {
                        addPvs([pv]);
                    } catch (e) {
                        console.log(e);
                        alert(e);
                    }
                });

                $(document).on("change", "#viewer-mode-select", function() {
                    if(this.value === "1") {
                        $("#start-date-input").parent("div").removeClass("ui-disabled");
                        $("#start-time-input").parent("div").removeClass("ui-disabled");
                        $("#end-date-input").parent("div").removeClass("ui-disabled");
                        $("#end-time-input").parent("div").removeClass("ui-disabled");

                        if(wave.windowStart && wave.windowEnd) {
                            $("#start-date-input").val(wave.util.toUserDateString(wave.windowStart));
                            $("#start-time-input").val(wave.util.toUserTimeString(wave.windowStart));
                            $("#end-date-input").val(wave.util.toUserDateString(wave.windowEnd));
                            $("#end-time-input").val(wave.util.toUserTimeString(wave.windowEnd));
                        }

                    } else {
                        $("#start-date-input").parent("div").addClass("ui-disabled");
                        $("#start-time-input").parent("div").addClass("ui-disabled");
                        $("#end-date-input").parent("div").addClass("ui-disabled");
                        $("#end-time-input").parent("div").addClass("ui-disabled");
                    }
                });

                $(document).on("panelbeforeopen", "#options-panel", function () {
                    $("#start-date-input").val(wave.util.toUserDateString(_chartManager.getOptions().start));
                    $("#start-time-input").val(wave.util.toUserTimeString(_chartManager.getOptions().start));
                    $("#end-date-input").val(wave.util.toUserDateString(_chartManager.getOptions().end));
                    $("#end-time-input").val(wave.util.toUserTimeString(_chartManager.getOptions().end));
                    $("#layout-mode-select").val(_chartManager.getOptions().layoutMode).change();
                    $("#viewer-mode-select").val(_chartManager.getOptions().viewerMode).change();
                    $("#mya-deployment").val(_chartManager.getOptions().myaDeployment);
                    $("#mya-limit").val(_chartManager.getOptions().myaLimit);
                    $("#live-window-minutes").val(_chartManager.getOptions().liveWindowMinutes);
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
/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {

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
                    oldStartMillis = jlab.wave.startDateAndTime.getTime(),
                    oldEndMillis = jlab.wave.endDateAndTime.getTime(),
                    startDateStr = $("#start-date-input").val(),
                    startTimeStr = $("#start-time-input").val(),
                    endDateStr = $("#end-date-input").val(),
                    endTimeStr = $("#end-time-input").val(),
                    startDate = jlab.wave.util.parseUserDate(startDateStr),
                    startTime = jlab.wave.util.parseUserTime(startTimeStr),
                    endDate = jlab.wave.util.parseUserDate(endDateStr),
                    endTime = jlab.wave.util.parseUserTime(endTimeStr);
            wave.startDateAndTime.setFullYear(startDate.getFullYear());
            wave.startDateAndTime.setMonth(startDate.getMonth());
            wave.startDateAndTime.setDate(startDate.getDate());
            wave.startDateAndTime.setHours(startTime.getHours());
            wave.startDateAndTime.setMinutes(startTime.getMinutes());
            wave.startDateAndTime.setSeconds(startTime.getSeconds());
            wave.endDateAndTime.setFullYear(endDate.getFullYear());
            wave.endDateAndTime.setMonth(endDate.getMonth());
            wave.endDateAndTime.setDate(endDate.getDate());
            wave.endDateAndTime.setHours(endTime.getHours());
            wave.endDateAndTime.setMinutes(endTime.getMinutes());
            wave.endDateAndTime.setSeconds(endTime.getSeconds());

            wave.controller.setMultiplePvMode(parseInt($("#multiple-pv-mode-select").val()));

            let newMode = parseInt($("#viewer-mode-select").val()),
                    oldMode = wave.controller.getViewerMode();
            if (newMode !== oldMode) {
                wave.controller.setViewerMode(newMode);
                fetchRequired = true;
            }

            wave.controller.validateOptions();

            if (oldStartMillis !== wave.startDateAndTime.getTime() || oldEndMillis !== wave.endDateAndTime.getTime()) {
                fetchRequired = true;
            }

            let uri = new URI();
            uri.setQuery("start", wave.util.toIsoDateTimeString(wave.startDateAndTime));
            uri.setQuery("end", wave.util.toIsoDateTimeString(wave.endDateAndTime));
            uri.setQuery("multiplePvMode", wave.controller.getMultiplePvMode());
            uri.setQuery("viewerMode", wave.controller.getViewerMode());
            window.history.replaceState({}, 'Set start and end', uri.href());

            if (fetchRequired) {
                wave.controller.refresh();
            } else {
                wave.controller.doLayout();
            }

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
                wave.controller.deletePvs([e.dataSeries.pv]);
                $("#pv-panel").panel("close");

            }
        });

        /* KEYBOARD EVENTS */

        $(document).on("keyup", "#pv-input", function (e) {
            if (e.keyCode === 13) {
                let pv = $.trim($("#pv-input").val());
                if (pv !== '') {
                    /*Replace all commas with space, split on any whitespace, filter out empty strings*/
                    let tokens = pv.replace(new RegExp(',', 'g'), " ").split(/\s/).filter(Boolean);

                    wave.controller.addPvs(tokens);
                }
                return false; /*Don't do default action*/
            }
        });

        /* JQUERY MOBILE UI EVENTS */

        $(document).on("pagecontainerchange", function () {
            /* We wrap in jQuery ready function since we want BOTH jquery mobile to be fully transitioned AND the DOM fully loaded*/
            $(function () {
                pageinit();
            });
        });
        $(document).on("panelbeforeopen", "#options-panel", function () {
            $("#start-date-input").val(wave.util.toUserDateString(wave.startDateAndTime));
            $("#start-time-input").val(wave.util.toUserTimeString(wave.startDateAndTime));
            $("#end-date-input").val(wave.util.toUserDateString(wave.endDateAndTime));
            $("#end-time-input").val(wave.util.toUserTimeString(wave.endDateAndTime));
            $("#multiple-pv-mode-select").val(wave.controller.getMultiplePvMode()).change();
            $("#viewer-mode-select").val(wave.controller.getViewerMode()).change();
        });

        /* DATEBOX EVENTS */

        /*I want button on right so this is a hack to switch it on pop-up 'open' - todo: just change the damn source code of 3rd-party lib*/
        $(document).on('datebox', function (e, passed) {
            if (passed.method === 'open') {
                $(".ui-datebox-container .ui-btn-left").removeClass("ui-btn-left").addClass("ui-btn-right");
            }
        });

        /* --- PAGE INIT ACTIONS --- */

        let pageinit = function () {
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

            /* CREATE A NEW VIEWER CONTROLLER OBJECT */
            wave.controller = new wave.ViewerController();

            wave.startDateAndTime.setMinutes(wave.startDateAndTime.getMinutes() - 5);

            let uri = new URI(),
                    queryMap = uri.query(true);
            if (uri.hasQuery("start")) {
                wave.startDateAndTime = wave.util.parseIsoDateTimeString(queryMap["start"]);
            } else {
                let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: wave.util.toIsoDateTimeString(wave.startDateAndTime)});
                window.history.replaceState({}, 'Set start: ' + wave.startDateAndTime, url);
            }

            if (uri.hasQuery("end")) {
                wave.endDateAndTime = wave.util.parseIsoDateTimeString(queryMap["end"]);
            } else {
                let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: wave.util.toIsoDateTimeString(wave.endDateAndTime)});
                window.history.replaceState({}, 'Set end: ' + wave.endDateAndTime, url);
            }

            if (uri.hasQuery("multiplePvMode")) {
                wave.controller.setMultiplePvMode(parseInt(queryMap["multiplePvMode"]));
            } else {
                let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {multiplePvMode: wave.controller.getMultiplePvMode()});
                window.history.replaceState({}, 'Set multiple PV Mode: ' + wave.controller.getMultiplePvMode(), url);
            }

            if (uri.hasQuery("viewerMode")) {
                wave.controller.setViewerMode(parseInt(queryMap["viewerMode"]));
            } else {
                let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {viewerMode: wave.controller.getViewerMode()});
                window.history.replaceState({}, 'Set viewer Mode: ' + wave.controller.getViewerMode(), url);
            }

            wave.controller.validateOptions();

            let pvs = queryMap["pv"] || [];
            if (!Array.isArray(pvs)) {
                pvs = [pvs];
            }

            if (wave.controller.getViewerMode() === wave.viewerModeEnum.ARCHIVE) {
                wave.controller.addPvs(pvs);
            } /*if STRIP the onopen callback will handle this*/

            /*Don't register resize event until after page load*/
            $(window).on("resize", function () {
                console.log("window resize");
                wave.controller.doLayout();
            });
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
var jlab = jlab || {};
jlab.wave = jlab.wave || {};

/* VARIABLES */

jlab.wave.viewerModeEnum = {ARCHIVE: 1, STRIP: 2, WAVEFORM: 3};
jlab.wave.multiplePvModeEnum = {SEPARATE_CHART: 1, SAME_CHART_SAME_AXIS: 2, SAME_CHART_SEPARATE_AXIS: 3};
jlab.wave.pvToSeriesMap = {};
/*jlab.wave.idToChartMap = {};*/
jlab.wave.pvs = [];
jlab.wave.charts = [];
jlab.wave.selectedSeries; /*When you click on series label in legend*/
/*http://colorbrewer2.org/#type=qualitative&scheme=Paired&n=5*/
jlab.wave.colors = ['#33a02c', '#1f78b4', '#fb9a99', '#a6cee3', '#b2df8a']; /*Make sure at least as many as MAX_PVS*/
/*jlab.wave.MAX_POINTS = 200;*/
jlab.wave.MAX_PVS = 5; /*Max Charts too*/
jlab.wave.maxPointsPerSeries = 100000;
jlab.wave.startDateAndTime = new Date();
jlab.wave.endDateAndTime = new Date(jlab.wave.startDateAndTime.getTime());
jlab.wave.multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART;
jlab.wave.viewerMode = jlab.wave.viewerModeEnum.ARCHIVE;
jlab.wave.layoutManager = new jlab.wave.LayoutManager($("#chart-container"));
jlab.wave.controller = new jlab.wave.ViewerController();

/* Event Listeners */

$(document).on("click", "#pv-info-list a", function () {
    $("#pv-panel").panel("close");
});
$(document).on("click", "#options-button", function () {
    $("#options-panel").panel("open");
});
$(document).on("keyup", "#pv-input", function (e) {
    if (e.keyCode === 13) {
        var pv = $.trim($("#pv-input").val());
        if (pv !== '') {
            /*Replace all commas with space, split on any whitespace, filter out empty strings*/
            var tokens = pv.replace(new RegExp(',', 'g'), " ").split(/\s/).filter(Boolean);

            jlab.wave.controller.addPvs(tokens);
        }
        return false; /*Don't do default action*/
    }
});
$(document).on("click", ".cancel-panel-button", function () {
    $(this).closest(".ui-panel").panel("close");
    return false;
});
$(document).on("panelbeforeopen", "#options-panel", function () {
    $("#start-date-input").val(jlab.wave.util.toUserDateString(jlab.wave.startDateAndTime));
    $("#start-time-input").val(jlab.wave.util.toUserTimeString(jlab.wave.startDateAndTime));
    $("#end-date-input").val(jlab.wave.util.toUserDateString(jlab.wave.endDateAndTime));
    $("#end-time-input").val(jlab.wave.util.toUserTimeString(jlab.wave.endDateAndTime));
    $("#multiple-pv-mode-select").val(jlab.wave.multiplePvMode).change();
});
$(document).on("click", "#update-options-button", function () {

    var fetchRequired = false,
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
    jlab.wave.startDateAndTime.setFullYear(startDate.getFullYear());
    jlab.wave.startDateAndTime.setMonth(startDate.getMonth());
    jlab.wave.startDateAndTime.setDate(startDate.getDate());
    jlab.wave.startDateAndTime.setHours(startTime.getHours());
    jlab.wave.startDateAndTime.setMinutes(startTime.getMinutes());
    jlab.wave.startDateAndTime.setSeconds(startTime.getSeconds());
    jlab.wave.endDateAndTime.setFullYear(endDate.getFullYear());
    jlab.wave.endDateAndTime.setMonth(endDate.getMonth());
    jlab.wave.endDateAndTime.setDate(endDate.getDate());
    jlab.wave.endDateAndTime.setHours(endTime.getHours());
    jlab.wave.endDateAndTime.setMinutes(endTime.getMinutes());
    jlab.wave.endDateAndTime.setSeconds(endTime.getSeconds());

    jlab.wave.multiplePvMode = parseInt($("#multiple-pv-mode-select").val());

    jlab.wave.controller.validateOptions();

    if (oldStartMillis !== jlab.wave.startDateAndTime.getTime() || oldEndMillis !== jlab.wave.endDateAndTime.getTime()) {
        fetchRequired = true;
    }

    var uri = new URI();
    uri.setQuery("start", jlab.wave.util.toIsoDateTimeString(jlab.wave.startDateAndTime));
    uri.setQuery("end", jlab.wave.util.toIsoDateTimeString(jlab.wave.endDateAndTime));
    uri.setQuery("multiplePvMode", jlab.wave.multiplePvMode);
    window.history.replaceState({}, 'Set start and end', uri.href());

    if (fetchRequired) {
        jlab.wave.controller.refresh();
    } else {
        jlab.wave.layoutManager.doLayout();
    }

    $("#options-panel").panel("close");
});
/*I want button on right so this is a hack to switch it on pop-up 'open' - todo: just change the damn source code of 3rd-party lib*/
$(document).on('datebox', function (e, passed) {
    if (passed.method === 'open') {
        $(".ui-datebox-container .ui-btn-left").removeClass("ui-btn-left").addClass("ui-btn-right");
    }
});
$(document).on("pagecontainershow", function () {

    var $page = $(".ui-page-active"),
            id = $page.attr("id"),
            $previousBtn = $("#previous-button");
    if (id === 'chart-page') {
        $previousBtn.hide();
    } else {
        $previousBtn.show();
    }

    setTimeout(function () { /*Stupidly I can't find an event that is trigger AFTER mobile page container div is done being sized so I just set delay!*/
        jlab.wave.startDateAndTime.setMinutes(jlab.wave.startDateAndTime.getMinutes() - 5);

        var uri = new URI(),
                queryMap = uri.query(true);
        if (uri.hasQuery("start")) {
            jlab.wave.startDateAndTime = jlab.wave.util.parseIsoDateTimeString(queryMap["start"]);
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: jlab.wave.util.toIsoDateTimeString(jlab.wave.startDateAndTime)});
            window.history.replaceState({}, 'Set start: ' + jlab.wave.startDateAndTime, url);
        }

        if (uri.hasQuery("end")) {
            jlab.wave.endDateAndTime = jlab.wave.util.parseIsoDateTimeString(queryMap["end"]);
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: jlab.wave.util.toIsoDateTimeString(jlab.wave.endDateAndTime)});
            window.history.replaceState({}, 'Set end: ' + jlab.wave.endDateAndTime, url);
        }

        if (uri.hasQuery("multiplePvMode")) {
            jlab.wave.multiplePvMode = parseInt(queryMap["multiplePvMode"]);
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {multiplePvMode: jlab.wave.multiplePvMode});
            window.history.replaceState({}, 'Set multiple PV Mode: ' + jlab.wave.multiplePvMode, url);
        }

        jlab.wave.controller.validateOptions();

        var pvs = queryMap["pv"] || [];
        if (!Array.isArray(pvs)) {
            pvs = [pvs];
        }

        jlab.wave.controller.addPvs(pvs);

        /*Don't register resize event until after page load*/
        $(window).on("resize", function () {
            console.log("window resize");
            /*var pageHeight = $(window).height();
             console.log(pageHeight);*/
            jlab.wave.layoutManager.doLayout();
        });

    }, 200);
});
$(document).on("click", "#pv-visibility-toggle-button", function () {
    var e = jlab.wave.selectedSeries;

    if (typeof jlab.wave.selectedSeries !== 'undefined') {
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
    var e = jlab.wave.selectedSeries;

    if (typeof jlab.wave.selectedSeries !== 'undefined') {
        jlab.wave.controller.deletePvs([e.dataSeries.pv]);
        $("#pv-panel").panel("close");

    }
});

/* PAGE READY EVENT */

$(function () {
    $("#header-panel").toolbar({theme: "a", tapToggle: false});
    $("#footer-panel").toolbar({theme: "a", tapToggle: false});
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
});

/* DATE-TIME-CHOOSER CONFIGURATION */

jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
    'maxDur': 86399,
    'lockInput': false
});
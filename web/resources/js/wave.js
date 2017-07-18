var jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.multiplePvModeEnum = {SEPARATE_CHART: 1, SAME_CHART_SAME_AXIS: 2, SAME_CHART_SEPARATE_AXIS: 3};
jlab.wave.pvToChartMap = {};
jlab.wave.pvToMetadataMap = {};
jlab.wave.pvToDataMap = {};
jlab.wave.idToChartMap = {};
jlab.wave.pvs = [];
jlab.wave.chartIdSequence = 0;
/*http://colorbrewer2.org/#type=qualitative&scheme=Paired&n=5*/
jlab.wave.colors = ['#33a02c', '#1f78b4', '#fb9a99', '#a6cee3', '#b2df8a']; /*Make sure at least as many as MAX_CHARTS*/
/*jlab.wave.MAX_POINTS = 200;*/
jlab.wave.MAX_CHARTS = 5; /*Max PVs too*/
jlab.wave.maxPointsPerSeries = 100000;
jlab.wave.startDateAndTime = new Date();
jlab.wave.endDateAndTime = new Date(jlab.wave.startDateAndTime.getTime());
jlab.wave.multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART;
jlab.wave.chartHolder = $("#chart-container");

jlab.wave.hasTouch = function () {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};
jlab.wave.pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
jlab.wave.toIsoDateTimeString = function (x) {
    var year = x.getFullYear(),
            month = x.getMonth() + 1,
            day = x.getDate(),
            hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return year + '-' + jlab.wave.pad(month, 2) + '-' + jlab.wave.pad(day, 2) + ' ' + jlab.wave.pad(hour, 2) + ':' + jlab.wave.pad(minute, 2) + ':' + jlab.wave.pad(second, 2);
};
jlab.wave.parseIsoDateTimeString = function (x) {
    var year = parseInt(x.substring(0, 4)),
            month = parseInt(x.substring(5, 7)) - 1,
            day = parseInt(x.substring(8, 10)),
            hour = parseInt(x.substring(11, 13)),
            minute = parseInt(x.substring(14, 16)),
            second = parseInt(x.substring(17, 19));
    return new Date(year, month, day, hour, minute, second);
};
jlab.wave.toUserDateString = function (x) {
    var year = x.getFullYear(),
            month = x.getMonth(),
            day = x.getDate();
    return jlab.wave.triCharMonthNames[month] + ' ' + jlab.wave.pad(day, 2) + ' ' + year;
};
jlab.wave.toUserTimeString = function (x) {
    var hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return jlab.wave.pad(hour, 2) + ':' + jlab.wave.pad(minute, 2) + ':' + jlab.wave.pad(second, 2);
};
jlab.wave.parseUserDate = function (x) {
    var month = jlab.wave.triCharMonthNames.indexOf(x.substring(0, 3)),
            day = parseInt(x.substring(4, 6)),
            year = parseInt(x.substring(7, 11));
    return new Date(year, month, day, 0, 0);
};
jlab.wave.parseUserTime = function (x) {
    var hour = parseInt(x.substring(0, 2)),
            minute = parseInt(x.substring(3, 5)),
            second = parseInt(x.substring(6, 9));
    return new Date(2000, 0, 1, hour, minute, second);
};
jlab.wave.Chart = function (pvs) {
    this.pvs = pvs;
    this.canvasjsChart = null;
    this.$placeholderDiv = null;

    jlab.wave.Chart.prototype.createCanvasJsChart = function (separateYAxis) {
        var chartId = 'chart-' + jlab.wave.chartIdSequence,
                chartBodyId = 'chart-body-' + jlab.wave.chartIdSequence++,
                labels = [],
                data = [],
                axisY = [];

        if (!separateYAxis) {
            axisY.push({
                title: 'EPICS Value',
                margin: 30
            });
        }

        for (var i = 0; i < this.pvs.length; i++) {
            var pv = this.pvs[i],
                    metadata = jlab.wave.pvToMetadataMap[pv],
                    lineDashType = "solid",
                    axisYIndex = 0,
                    colorIndex = i;

            if (this.pvs.length === 1) {
                colorIndex = jlab.wave.pvs.indexOf(pv);
            }

            if (metadata.sampled === true) {
                labels[i] = pv + ' (Sampled)';
                lineDashType = "dot";
            } else {
                labels[i] = pv;
            }

            if (separateYAxis) {
                axisYIndex = i;
                axisY.push({title: pv + ' Value', margin: 30, lineColor: jlab.wave.colors[colorIndex], labelFontColor: jlab.wave.colors[colorIndex], titleFontColor: jlab.wave.colors[colorIndex]});
            }

            data.push({xValueFormatString:"MMM-DD-YYYY HH:mm:ss", showInLegend: (pvs.length > 1), legendText: pv, axisYindex: axisYIndex, color: jlab.wave.colors[colorIndex], type: "line", lineDashType: lineDashType, markerType: "none", xValueType: "dateTime", dataPoints: jlab.wave.pvToDataMap[pvs[i]]});
        }

        var title = labels[0];

        for (var i = 1; i < labels.length; i++) {
            title = title + ", " + labels[i];
        }

        this.$placeholderDiv = $('<div id="' + chartId + '" class="chart"><div class="chart-title-bar"><button type="button" class="chart-close-button">X</button></div><div id="' + chartBodyId + '" class="chart-body"></div></div>');
        jlab.wave.chartHolder.append(this.$placeholderDiv);
        jlab.wave.idToChartMap[chartId] = this;
        var minDate = jlab.wave.startDateAndTime,
                maxDate = jlab.wave.endDateAndTime;

        this.canvasjsChart = new CanvasJS.Chart(chartBodyId, {
            zoomEnabled: true,
            title: {
                text: title
            },
            legend: {
                horizontalAlign: "center",
                verticalAlign: "top",
                cursor: "pointer",
                itemclick: function (e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }

                    e.chart.render();
                }
            },
            axisY: axisY,
            axisX: {
                title: 'Time',
                /*valueFormatString: "DD-MMM-YYYY HH:mm:ss",*/
                labelAngle: -45,
                minimum: minDate,
                maximum: maxDate
            },
            data: data
        });

        return this.$placeholderDiv;
    };
};

jlab.wave.refresh = function () {

    console.log('refresh');

    var promiseArray = [];

    $.mobile.loading("show", {textVisible: true, theme: "b"});

    for (var i = 0; i < jlab.wave.pvs.length; i++) {
        var pv = jlab.wave.pvs[i],
                promise = jlab.wave.getData(pv, true);

        promiseArray.push(promise);
    }

    $.when.apply($, promiseArray).done(function () {
        $.mobile.loading("hide");
        jlab.wave.doLayout();
    });

};

jlab.wave.addPv = function (pv, multiple) {
    if (typeof jlab.wave.pvToChartMap[pv] !== 'undefined') {
        alert('Already charting pv: ' + pv);
        return;
    }

    var $charts = jlab.wave.chartHolder.find(".chart");
    if ($charts.length + 1 > jlab.wave.MAX_CHARTS) {
        alert('Too many charts; maximum number is: ' + jlab.wave.MAX_CHARTS);
        return;
    }

    jlab.wave.pvs.push(pv);

    jlab.wave.pvs.sort();

    var promise = jlab.wave.getData(pv, multiple);

    $("#pv-input").val("");
    $("#chart-container").css("border", "none");
    var uri = new URI(),
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
        var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {pv: pv});
        window.history.replaceState({}, 'Add pv: ' + pv, url);
    }

    return promise;
};
jlab.wave.getData = function (pv, multiple) {
    /*In case things go wrong we set to empty*/
    jlab.wave.pvToMetadataMap[pv] = {};
    jlab.wave.pvToDataMap[pv] = [];

    var url = '/myget/jmyapi-span-data',
            data = {
                c: pv,
                b: jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime),
                e: jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime),
                t: '',
                l: jlab.wave.maxPointsPerSeries
            },
            dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType, timeout: 30000};

    if (!multiple) {
        $.mobile.loading("show", {textVisible: true, theme: "b"});
    }

    options.beforeSend = function () {
        console.time("fetch " + pv); /*This isn't perfect due to event queue running whenever*/
    };

    var promise = $.ajax(options);
    promise.done(function (json) {
        console.timeEnd("fetch " + pv);
        /*console.log(json);*/

        jlab.wave.pvToMetadataMap[pv] = {'datatype': json.datatype, 'datasize': json.datasize, 'sampled': json.sampled, 'count': json.count};

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

        var makeStepLine;

        if (json.sampled === true) {
            makeStepLine = false;
        } else {
            makeStepLine = true;
        }

        var formattedData = [],
                prev = null;

        if (makeStepLine) {
            for (var i = 0; i < json.data.length; i++) {
                var record = json.data[i],
                        timestamp = record.d,
                        value = parseFloat(record.v),
                        point;

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
            for (var i = 0; i < json.data.length; i++) {
                var record = json.data[i],
                        timestamp = record.d,
                        value = parseFloat(record.v),
                        point;

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

        jlab.wave.pvToDataMap[pv] = formattedData;

        console.log('database event count: ' + json.count);
        console.log('transferred points: ' + json.data.length);
        console.log('total points (includes steps): ' + formattedData.length);
    });
    promise.error(function (xhr, t, m) {
        var json;
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

        var message = json.error || 'Server did not handle request';
        alert('Unable to perform request: ' + message);
    });
    promise.always(function () {
        if (!multiple) {
            $.mobile.loading("hide");
            jlab.wave.doLayout();
        }
    });
    return promise;
};

jlab.wave.doLayout = function () {
    jlab.wave.chartHolder.empty();

    /*console.log('doLayout');
     console.log('pvs: ' + jlab.wave.pvs);*/

    if (jlab.wave.multiplePvMode === jlab.wave.multiplePvModeEnum.SEPARATE_CHART) {
        jlab.wave.doSeparateChartLayout();
    } else {
        jlab.wave.doSingleChartLayout();
    }
};
jlab.wave.doSingleChartLayout = function () {
    if (jlab.wave.pvs.length > 0) {
        var c = new jlab.wave.Chart(jlab.wave.pvs),
                $placeholderDiv = c.createCanvasJsChart(jlab.wave.multiplePvMode === jlab.wave.multiplePvModeEnum.SAME_CHART_SEPARATE_AXIS);
        $placeholderDiv.css("top", 0);
        $placeholderDiv.height(jlab.wave.chartHolder.height());

        console.time("render");
        c.canvasjsChart.render();
        console.timeEnd("render");
    }
};
jlab.wave.doSeparateChartLayout = function () {
    var offset = 0;

    for (var i = 0; i < jlab.wave.pvs.length; i++) {
        var pv = jlab.wave.pvs[i],
                c = new jlab.wave.Chart([pv]),
                $placeholderDiv = c.createCanvasJsChart(),
                chartHeight = jlab.wave.chartHolder.height() / jlab.wave.pvs.length;

        $placeholderDiv.css("top", offset);
        offset = offset + chartHeight;
        $placeholderDiv.height(chartHeight);

        console.time("render");
        c.canvasjsChart.render();
        console.timeEnd("render");
    }
};
$(document).on("click", ".chart-close-button", function () {
    var $placeholderDiv = $(this).closest(".chart"),
            id = $placeholderDiv.attr("id"),
            chart = jlab.wave.idToChartMap[id];
    pvs = chart.pvs;

    $placeholderDiv.remove();
    delete chart;

    var uri = new URI();

    for (var i = 0; i < pvs.length; i++) {
        var pv = pvs[i];
        delete jlab.wave.pvToChartMap[pv];
        delete jlab.wave.pvToDataMap[pv];
        delete jlab.wave.pvToMetadataMap[pv];

        var index = jlab.wave.pvs.indexOf(pv);
        console.log('before: ' + jlab.wave.pvs);
        console.log('index: ' + index);
        var out = jlab.wave.pvs.splice(index, 1);

        console.log('out: ' + out);

        uri.removeQuery("pv", pv);
    }

    console.log('after: ' + jlab.wave.pvs);

    jlab.wave.doLayout();

    if (Object.keys(jlab.wave.pvToChartMap).length === 0) {
        $("#chart-container").css("border", "1px dashed black");
    }


    var url = uri.href();
    window.history.replaceState({}, 'Remove pvs: ' + pvs, url);
});
$(document).on("click", "#options-button", function () {
    $("#options-panel").panel("open");
});
$(document).on("keyup", "#pv-input", function (e) {
    if (e.keyCode === 13) {
        var pv = $.trim($("#pv-input").val());
        if (pv !== '') {
            jlab.wave.addPv(pv);
        }
        return false; /*Don't do default action*/
    }
});
$(document).on("click", "#cancel-datepicker", function () {
    $("#options-panel").panel("close");
    return false;
});
$(document).on("panelbeforeopen", "#options-panel", function () {
    $("#start-date-input").val(jlab.wave.toUserDateString(jlab.wave.startDateAndTime));
    $("#start-time-input").val(jlab.wave.toUserTimeString(jlab.wave.startDateAndTime));
    $("#end-date-input").val(jlab.wave.toUserDateString(jlab.wave.endDateAndTime));
    $("#end-time-input").val(jlab.wave.toUserTimeString(jlab.wave.endDateAndTime));
    $("#multiple-pv-mode-select").val(jlab.wave.multiplePvMode).change();
});
$(document).on("click", "#update-options-button", function () {

    console.log('update button pressed');

    var startDateStr = $("#start-date-input").val(),
            startTimeStr = $("#start-time-input").val(),
            endDateStr = $("#end-date-input").val(),
            endTimeStr = $("#end-time-input").val();
    var startDate = jlab.wave.parseUserDate(startDateStr),
            startTime = jlab.wave.parseUserTime(startTimeStr),
            endDate = jlab.wave.parseUserDate(endDateStr),
            endTime = jlab.wave.parseUserTime(endTimeStr);
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

    var uri = new URI();
    uri.setQuery("start", jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime));
    uri.setQuery("end", jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime));
    uri.setQuery("multiplePvMode", jlab.wave.multiplePvMode);
    window.history.replaceState({}, 'Set start and end', uri.href());
    jlab.wave.refresh();
    $("#options-panel").panel("close");
});

$(function () {
    $("#header-panel").toolbar({theme: "a", tapToggle: false});
    $("#footer-panel").toolbar({theme: "a", tapToggle: false});
    if (jlab.wave.hasTouch()) {
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
            jlab.wave.startDateAndTime = jlab.wave.parseIsoDateTimeString(queryMap["start"]);

            /*Verify valid number*/
            if (jlab.wave.startDateAndTime.getTime() !== jlab.wave.startDateAndTime.getTime()) { /*Only NaN is not equal itself*/
                jlab.wave.startDateAndTime = new Date();
            }
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime)});
            window.history.replaceState({}, 'Set start: ' + jlab.wave.startDateAndTime, url);
        }

        if (uri.hasQuery("end")) {
            jlab.wave.endDateAndTime = jlab.wave.parseIsoDateTimeString(queryMap["end"]);

            /*Verify valid number*/
            if (jlab.wave.endDateAndTime.getTime() !== jlab.wave.endDateAndTime.getTime()) { /*Only NaN is not equal itself*/
                jlab.wave.endDateAndTime = new Date();
            }

        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime)});
            window.history.replaceState({}, 'Set end: ' + jlab.wave.endDateAndTime, url);
        }

        if (uri.hasQuery("multiplePvMode")) {
            jlab.wave.multiplePvMode = parseInt(queryMap["multiplePvMode"]);

            /*Verify valid number*/
            if (jlab.wave.multiplePvMode !== jlab.wave.multiplePvMode) { /*Only NaN is not equal itself*/
                jlab.wave.multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART;
            }

        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {multiplePvMode: jlab.wave.multiplePvMode});
            window.history.replaceState({}, 'Set multiple PV Mode: ' + jlab.wave.multiplePvMode, url);
        }

        var i, pvs = queryMap["pv"] || [];
        if (!Array.isArray(pvs)) {
            pvs = [pvs];
        }

        var promiseArray = [];

        $.mobile.loading("show", {textVisible: true, theme: "b"});

        for (var i = 0; i < pvs.length; i++) {
            var promise = jlab.wave.addPv(pvs[i], true);

            promiseArray.push(promise);
        }

        $.when.apply($, promiseArray).done(function () {
            $.mobile.loading("hide");
            jlab.wave.doLayout();
        });

        /*Don't register resize event until after page load*/
        $(window).on("resize", function () {
            console.log("window resize");
            /*var pageHeight = $(window).height();
             console.log(pageHeight);*/
            jlab.wave.doLayout();
        });

    }, 200);
});
jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
    'maxDur': 86399,
    'lockInput': false
});
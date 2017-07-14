var jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.pvToChartMap = {};
/*jlab.wave.charts = [];*/
/*jlab.wave.MAX_POINTS = 200;*/
jlab.wave.MAX_CHARTS = 5;
jlab.wave.maxPointsPerSeries = 100000;
jlab.wave.startDateAndTime = new Date();
jlab.wave.endDateAndTime = new Date(jlab.wave.startDateAndTime.getTime());
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
jlab.wave.Chart = function (pv, plot) {
    this.pv = pv;
    this.plot = plot;
    this.data = [];
    this.prev = null;
    this.lastUpdated = null;
    this.i = 0;
    this.metadata = null;
    this.$div = null;
    jlab.wave.Chart.prototype.addPointSquare = function (point) {
        if (typeof point !== 'undefined') {
            if (this.data.length >= jlab.wave.MAX_POINTS) {
                this.data = this.data.slice(2);
            }

            if (this.prev !== null) {
                this.data.push([this.i, this.prev]);
            }

            this.prev = point;
            this.data.push([this.i++, point]);
        }
    };
};

jlab.wave.refresh = function () {
    jlab.wave.refreshCanvasJS();
};

jlab.wave.refreshFlot = function () {
    for (var key in jlab.wave.pvToChartMap) {
        var chart = jlab.wave.pvToChartMap[key];
        /*console.log(key);
         console.log(chart);*/

        chart.plot.getOptions().xaxes[0].min = jlab.wave.startDateAndTime;
        chart.plot.getOptions().xaxes[0].max = jlab.wave.endDateAndTime;
        jlab.wave.getData(chart);
    }
};

jlab.wave.refreshCanvasJS = function () {
    for (var key in jlab.wave.pvToChartMap) {
        var chart = jlab.wave.pvToChartMap[key];
        /*console.log(key);
         console.log(chart);*/

        /*chart.plot.getOptions().xaxes[0].min = jlab.wave.startDateAndTime;
         chart.plot.getOptions().xaxes[0].max = jlab.wave.endDateAndTime;*/
        jlab.wave.getData(chart);
    }
};

jlab.wave.addPv = function (pv) {
    jlab.wave.addPvCanvasJS(pv);
};
jlab.wave.addPvCanvasJS = function (pv) {
    if (typeof jlab.wave.pvToChartMap[pv] !== 'undefined') {
        alert('Already charting pv: ' + pv);
        return;
    }

    var $chartHolder = $("#chart-container"),
            $charts = $chartHolder.find(".chart");
    if ($charts.length + 1 > jlab.wave.MAX_CHARTS) {
        alert('Too many charts; maximum number is: ' + jlab.wave.MAX_CHARTS);
        return;
    }

    var $div = $('<div class="chart" data-pv="' + pv + '"><div class="chart-title-bar"><button type="button" class="chart-close-button">X</button></div><div id="div' + pv + '" class="chart-body"></div></div>');
    $chartHolder.append($div);
    /*jlab.wave.doLayout();*/
    var minDate = jlab.wave.startDateAndTime,
            maxDate = jlab.wave.endDateAndTime;

    var chart = new CanvasJS.Chart("div" + pv, {
        title: {
            text: pv
        },
        axisY: {
            title: 'EPICS Value',
            margin: 30
        },
        axisX: {
            title: 'Time',
            /*valueFormatString: "DD-MMM-YYYY HH:mm:ss",*/
            labelAngle: -45
        },
        data: [{type: "line", markerType: "none", xValueType: "dateTime", dataPoints: []}]
    });
    /*chart.render();*/
    var c = new jlab.wave.Chart(pv, chart);
    jlab.wave.pvToChartMap[pv] = c;
    c.$div = $div;
    jlab.wave.getData(c);
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
};
jlab.wave.getData = function (c) {
    jlab.wave.getDataCanvasJS(c);
};

jlab.wave.getDataCanvasJS = function (c) {
    var url = '/myget/jmyapi-span-data',
            data = {
                c: c.pv,
                b: jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime),
                e: jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime),
                t: '',
                l: jlab.wave.maxPointsPerSeries
            },
            dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType, timeout: 30000};
    $.mobile.loading("show", {textVisible: true, theme: "b"});

    options.beforeSend = function () {
        console.time("fetch"); /*This isn't perfect due to event queue running whenever*/
    };

    var promise = $.ajax(options);
    promise.done(function (json) {
        console.timeEnd("fetch");
        /*console.log(json);*/

        c.metadata = {'datatype': json.datatype, 'datasize': json.datasize, 'sampled': json.sampled, 'count': json.count};
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
            c.$div.addClass("sampled-data");
            makeStepLine = false;
            c.plot.options.title.text = c.pv + ' (Sampled)';
            c.plot.options.data[0].lineDashType = "dot";

            //c.plot.options.data[0].type = "scatter";
            //c.plot.options.data[0].markerType = "square"; //square renders WAY faster than circle
            //c.plot.options.data[0].color = "red";
        } else {
            c.$div.removeClass("sampled-data");
            makeStepLine = true;
            c.plot.options.title.text = c.pv;
            c.plot.options.data[0].lineDashType = "solid";
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

        console.log('database event count: ' + json.count);
        console.log('transferred points: ' + json.data.length);
        console.log('total points (includes steps): ' + formattedData.length);
        /*console.log(flotFormattedData);*/

        c.plot.options.data[0].dataPoints = formattedData;

        /*console.time("draw");
         c.plot.render();
         console.timeEnd("draw");*/
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
        $.mobile.loading("hide");
        /*console.log("data request complete");*/
        jlab.wave.doLayout();
    });
    return promise;
};

jlab.wave.doLayout = function () {
    var $chartHolder = $("#chart-container"),
            $charts = $chartHolder.find(".chart");
    var offset = 0;

    /*console.log("doLayout: chartHolder Height: " + $chartHolder.height());*/

    $charts.each(function () {
        var chartHeight = $chartHolder.height() / $charts.length;
        $(this).css("top", offset);
        offset = offset + chartHeight;
        $(this).height(chartHeight);

        var pv = $(this).attr("data-pv"),
                chart = jlab.wave.pvToChartMap[pv];
        console.time("render");
        chart.plot.render();
        console.timeEnd("render");
    });
};
$(document).on("click", ".chart-close-button", function () {
    var $chart = $(this).closest(".chart"),
            pv = $chart.attr("data-pv");
    $chart.remove();
    delete jlab.wave.pvToChartMap[pv];
    jlab.wave.doLayout();
    if (Object.keys(jlab.wave.pvToChartMap).length === 0) {
        $("#chart-container").css("border", "1px dashed black");
    }

    var uri = new URI();
    uri.removeQuery("pv", pv);
    var url = uri.href();
    window.history.replaceState({}, 'Remove pv: ' + pv, url);
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
});
$(document).on("click", "#update-datetime-button", function () {
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
    var uri = new URI();
    uri.setQuery("start", jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime));
    uri.setQuery("end", jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime));
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

    /*jlab.wave.doLayout(true);*/
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
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime)});
            window.history.replaceState({}, 'Set start: ' + jlab.wave.startDateAndTime, url);
        }

        if (uri.hasQuery("end")) {
            jlab.wave.endDateAndTime = jlab.wave.parseIsoDateTimeString(queryMap["end"]);
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime)});
            window.history.replaceState({}, 'Set end: ' + jlab.wave.endDateAndTime, url);
        }

        var i, pvs = queryMap["pv"] || [];
        if (!Array.isArray(pvs)) {
            pvs = [pvs];
        }

        for (var i = 0; i < pvs.length; i++) {
            jlab.wave.addPv(pvs[i]);
        }

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
var jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.pvToChartMap = {};
jlab.wave.MAX_POINTS = 200;
jlab.wave.MAX_CHARTS = 5;
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
            minute = x.getMinutes();

    return year + '-' + jlab.wave.pad(month, 2) + '-' + jlab.wave.pad(day, 2) + ' ' + jlab.wave.pad(hour, 2) + ':' + jlab.wave.pad(minute, 2);
};

jlab.wave.toUserDateString = function (x) {
    var year = x.getFullYear(),
            month = x.getMonth(),
            day = x.getDate();

    return jlab.wave.triCharMonthNames[month] + ' ' + jlab.wave.pad(day, 2) + ' ' + year;
};

jlab.wave.toUserTimeString = function (x) {
    var hour = x.getHours(),
            minute = x.getMinutes();

    return jlab.wave.pad(hour, 2) + ':' + jlab.wave.pad(minute, 2);
};

jlab.wave.parseUserDate = function (x) {
    var month = jlab.wave.triCharMonthNames.indexOf(x.substring(0, 3)),
            day = parseInt(x.substring(4, 6)),
            year = parseInt(x.substring(7, 11));

    return new Date(year, month, day, 0, 0);
};

jlab.wave.parseUserTime = function (x) {
    var hour = parseInt(x.substring(0, 2)),
            minute = parseInt(x.substring(4, 6));

    return new Date(2000, 0, 1, hour, minute);
};

jlab.wave.Chart = function (pv, plot) {
    this.pv = pv;
    this.plot = plot;
    this.data = [];
    this.prev = null;
    this.lastUpdated = null;
    this.i = 0;

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
    for (var key in jlab.wave.pvToChartMap) {
        var chart = jlab.wave.pvToChartMap[key];
        console.log(key);
        console.log(chart);

        chart.plot.getOptions().xaxes[0].min = jlab.wave.startDateAndTime;
        chart.plot.getOptions().xaxes[0].max = jlab.wave.endDateAndTime;

        jlab.wave.getData(chart);
    };
};

jlab.wave.addPv = function (pv) {
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

    var $div = $('<div class="chart"><div class="chart-title-bar"><span class="chart-title">' + pv + '</span><button type="button" class="chart-close-button">X</button></div><div class="chart-body"></div></div>');

    $chartHolder.append($div);

    jlab.wave.doLayout();

    var minDate = jlab.wave.startDateAndTime,
            maxDate = jlab.wave.endDateAndTime;

    var $placeholder = $div.find(".chart-body"),
            plot = $.plot($placeholder, [[]], {
                legend: {
                    show: false
                },
                series: {
                    lines: {
                        show: true,
                        steps: false /*This is busted; we'll do it manually*/
                    },
                    points: {
                        show: false
                    },
                    shadowSize: 0 /*Performance better without*/
                },
                xaxis: {
                    show: true,
                    min: minDate.getTime(),
                    max: maxDate.getTime(),
                    mode: "time",
                    timezone: "browser" /*browser local*/
                },
                yaxis: {
                    show: true,
                    labelWidth: 75
                },
                grid: {
                    hoverable: true,
                    autoHighlight: false
                },
                tooltip: {
                    show: true,
                    lines: true,
                    content: "%s | x: %x; y: %y",
                    xDateFormat: "%Y-%m-%d %H:%M:%S"
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true,
                    frameRate: 24
                }
            });

    var c = new jlab.wave.Chart(pv, plot);

    jlab.wave.pvToChartMap[pv] = c;

    jlab.wave.getData(c);

    $("#pv-input").val("");
    $("#chart-container").css("border", "none");
};

jlab.wave.getData = function (c) {
    var url = jlab.wave.mygetUrl + '/span-data',
            data = {
                c: c.pv,
                b: jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime),
                e: jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime)
            },
    dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType};

    if (url.indexOf("/") !== 0) {
        dataType = "jsonp";
        options.dataType = dataType;
        options.jsonp = 'jsonp';
    }

    $.mobile.loading("show", {textVisible: true, theme: "b"});

    var promise = $.ajax(options);

    promise.done(function (json) {
        /*console.log(json);*/

        var flotFormattedData = [],
                prev = null;

        for (var i = 0; i < json.data.length; i++) {
            var record = json.data[i],
                    /* Date must be ISO 8601 format with time (Not just date).
                     * Only interrepted as local time zone due to time; if just date it
                     * would be interpreted as UTC time zone.
                     */
                    timestamp = Date.parse(record.date),
                    value = parseFloat(record.value), /*Should already be float?*/
                    point = [timestamp, value];

            if (prev !== null) {
                flotFormattedData.push([timestamp, prev]);
            }

            flotFormattedData.push(point);

            prev = value;
        }

        console.log(flotFormattedData);

        c.data = {label: c.pv, data: flotFormattedData};
        c.plot.setData([c.data]);
        c.plot.setupGrid();
        c.plot.draw();
    });

    promise.error(function (xhr) {
        var json;

        try {
            if (typeof xhr.responseText === 'undefined' || xhr.responseText === '') {
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
    });

    return promise;
};

jlab.wave.doLayout = function () {
    var $chartHolder = $("#chart-container"),
            $charts = $chartHolder.find(".chart");

    var offset = 0;

    $charts.each(function () {
        var chartHeight = $chartHolder.height() / $charts.length;

        $(this).css("top", offset);
        offset = offset + chartHeight;

        $(this).height(chartHeight);
    });
};

$(document).on("click", ".chart-close-button", function () {
    var $chart = $(this).closest(".chart"),
            pv = $chart.find(".chart-title").text();
    $chart.remove();
    delete jlab.wave.pvToChartMap[pv];
    jlab.wave.doLayout();

    if (Object.keys(jlab.wave.pvToChartMap).length === 0) {
        $("#chart-container").css("border", "1px dashed black");
    }
});

$(document).on("click", "#go-button", function () {
    var pv = $.trim($("#pv-input").val());

    if (pv === '') {
        alert('Please provide an EPICS PV name');
    } else {
        jlab.wave.addPv(pv);
    }

    return false;
});

$(document).on("click", "#options-button", function () {
    $("#options-panel").panel("open");
});

$(document).on("keyup", "#pv-input", function (e) {
    if (e.keyCode === 13) {
        $("#go-button").click();
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

    jlab.wave.endDateAndTime.setFullYear(endDate.getFullYear());
    jlab.wave.endDateAndTime.setMonth(endDate.getMonth());
    jlab.wave.endDateAndTime.setDate(endDate.getDate());
    jlab.wave.endDateAndTime.setHours(endTime.getHours());
    jlab.wave.endDateAndTime.setMinutes(endTime.getMinutes());

    jlab.wave.refresh();

    $("#options-panel").panel("close");
});

$(window).on("resize", function () {
    /*var pageHeight = $(window).height();
     console.log(pageHeight);*/
    jlab.wave.doLayout();
});

$(document).on("pageshow", function () {
    var $page = $(".ui-page-active"),
            id = $page.attr("id"),
            $previousBtn = $("#previous-button");
    if (id === 'chart-page') {
        $previousBtn.hide();
    } else {
        $previousBtn.show();
    }
});
$(document).bind("mobileinit", function () {
    $.mobile.autoInitialize = false;
});
$(function () {
    jlab.wave.startDateAndTime.setMinutes(jlab.wave.startDateAndTime.getMinutes() - 5);

    $("#header-panel").toolbar({theme: "a", tapToggle: false});
    $("#footer-panel").toolbar({theme: "a", tapToggle: false});

    if (jlab.wave.hasTouch()) {
        $("#start-date-input").datebox({mode: "flipbox"});
        $("#start-time-input").datebox({mode: "timeflipbox"});
        $("#end-date-input").datebox({mode: "flipbox"});
        $("#end-time-input").datebox({mode: "timeflipbox"});
    } else {
        $("#start-date-input").datebox({mode: "calbox"});
        $("#start-time-input").datebox({mode: "timebox"});
        $("#end-date-input").datebox({mode: "calbox"});
        $("#end-time-input").datebox({mode: "timebox"});
    }
});
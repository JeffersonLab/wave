/* jlab.wave 'NAMESPACE' */

var jlab = jlab || {};
jlab.wave = jlab.wave || {};

/* VARIABLES */

jlab.wave.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
jlab.wave.chartHolder = $("#chart-container");

/* UTILITY FUNCTIONS */

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
jlab.wave.intToStringWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
jlab.wave.toUserDateTimeString = function (x) {
    var year = x.getFullYear(),
            month = x.getMonth(),
            day = x.getDate(),
            hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return jlab.wave.triCharMonthNames[month] + ' ' + jlab.wave.pad(day, 2) + ' ' + year + ' ' + jlab.wave.pad(hour, 2) + ':' + jlab.wave.pad(minute, 2) + ':' + jlab.wave.pad(second, 2);
};
jlab.wave.parseUserDate = function (x) {
    var month = jlab.wave.triCharMonthNames.indexOf(x.substring(0, 3)),
            day = parseInt(x.substring(4, 6)),
            year = parseInt(x.substring(7, 11));
    return new Date(year, month, day, 0, 0);
};
jlab.wave.parseUserTime = function (x) {

    var hour, minute, second;

    if (x.trim() === '') {
        hour = 0;
        minute = 0;
        second = 0;
    } else {
        hour = parseInt(x.substring(0, 2));
        minute = parseInt(x.substring(3, 5));
        second = parseInt(x.substring(6, 9));
    }

    return new Date(2000, 0, 1, hour, minute, second);
};

/* Event Actions */

/* Sync zoom of all charts and update chart tick label format and tick interval */
jlab.wave.zoomRangeChange = function (e) {

    var viewportMinimum = e.axisX[0].viewportMinimum,
            viewportMaximum = e.axisX[0].viewportMaximum,
            timeInfo = e.chart.options.timeInfo,
            valueFmtString = timeInfo.adjustForViewportZoom(viewportMinimum, viewportMaximum);

    for (var i = 0; i < jlab.wave.charts.length; i++) {
        var c = jlab.wave.charts[i].canvasjsChart;

        if (!c.options.axisX) {
            c.options.axisX = {};
        }

        if (e.trigger === "reset") {
            c.options.axisX.viewportMinimum = c.options.axisX.viewportMaximum = null;

            c.options.axisX.valueFormatString = timeInfo.startingTickFormat;
            c.options.axisX.interval = timeInfo.startingInterval;
            c.options.axisX.intervalType = timeInfo.startingIntervalType;

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
                c.options.axisX.valueFormatString = valueFmtString;
                c.options.axisX.interval = timeInfo.interval;
                c.options.axisX.intervalType = timeInfo.intervalType;
            }

            if (c !== e.chart) {
                c.render();
            }
        }
    }
};
jlab.wave.refresh = function () {
    jlab.wave.multiplePvAction(jlab.wave.pvs, false); /*false means getData only*/
};
jlab.wave.addPv = function (pv, multiple) {
    if (jlab.wave.pvs.indexOf(pv) !== -1) {
        alert('Already charting pv: ' + pv);
        return;
    }

    if (jlab.wave.pvs.length + 1 > jlab.wave.MAX_PVS) {
        alert('Too many pvs; maximum number is: ' + jlab.wave.MAX_PVS);
        return;
    }

    jlab.wave.pvs.push(pv);

    jlab.wave.pvs.sort();

    var series = new jlab.wave.Series(pv);

    jlab.wave.pvToSeriesMap[pv] = series;

    series.preferences = {
        color: jlab.wave.colors.shift()
    };

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
    var series = jlab.wave.pvToSeriesMap[pv];
    series.metadata = {};
    series.data = [];

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

        var makeStepLine = true; /*Since we are using dashed line for sampled we probably should step line too*/

        /*if (json.sampled === true) {
         makeStepLine = false;
         } else {
         makeStepLine = true;
         }*/

        var formattedData = [],
                prev = null,
                minY = Number.POSITIVE_INFINITY,
                maxY = Number.NEGATIVE_INFINITY;

        if (makeStepLine) {
            for (var i = 0; i < json.data.length; i++) {
                var record = json.data[i],
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

                if (value < minY) {
                    minY = value;
                }
                if (value > maxY) {
                    maxY = value;
                }

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

        console.log('database event count: ' + jlab.wave.intToStringWithCommas(json.count));
        console.log('transferred points: ' + jlab.wave.intToStringWithCommas(json.data.length));
        console.log('total points (includes steps): ' + jlab.wave.intToStringWithCommas(formattedData.length));
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
        /*Need to figure out how to include series in legend even if no data; until then we'll just always add a point if empty*/
        if (series.data.length === 0) {
            series.data = [{x: jlab.wave.startDateAndTime, y: 0, markerType: 'cross', markerColor: 'red', markerSize: 12, toolTipContent: pv + ": NO DATA"}];
        }

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
        var c = new jlab.wave.Chart(jlab.wave.pvs, jlab.wave.multiplePvMode === jlab.wave.multiplePvModeEnum.SAME_CHART_SEPARATE_AXIS);
        
        c.$placeholderDiv.css("top", 0);
        c.$placeholderDiv.height(jlab.wave.chartHolder.height());

        console.time("render");
        c.canvasjsChart.render();
        console.timeEnd("render");

        jlab.wave.updateChartToolbars();
    }
};
jlab.wave.doSeparateChartLayout = function () {
    var offset = 0;

    for (var i = 0; i < jlab.wave.pvs.length; i++) {
        var pv = jlab.wave.pvs[i],
                c = new jlab.wave.Chart([pv]),
                chartHeight = jlab.wave.chartHolder.height() / jlab.wave.pvs.length;

        c.$placeholderDiv.css("top", offset);
        offset = offset + chartHeight;
        c.$placeholderDiv.height(chartHeight);

        console.time("render");
        c.canvasjsChart.render();
        console.timeEnd("render");

        jlab.wave.updateChartToolbars();
    }
};
jlab.wave.csvexport = function () {
    var data = '',
            filename = 'chart.csv',
            type = 'text/csv';

    /*TODO: figure out which chart is being export and only get pvs from it*/
    for (var i = 0; i < jlab.wave.pvs.length; i++) {
        var pv = jlab.wave.pvs[i],
                series = jlab.wave.pvToSeriesMap[pv],
                d = series.data;

        data = data + '--- ' + pv + ' ---\r\n';
        for (var j = 0; j < d.length; j++) {
            if (!(j % 2)) { /*Only output even to skip stepped points */
                data = data + jlab.wave.toIsoDateTimeString(new Date(d[j].x)) + ',' + d[j].y + '\r\n';
            }
        }
    }

    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
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
jlab.wave.updateChartToolbars = function () {
    $(".csv-menu-item, .options-button").remove();
    $(".canvasjs-chart-toolbar").each(function () {
        /*CSV menu item*/
        var $menu = $(this).find("> div");
        var $div = $('<div class="csv-menu-item" style="padding: 2px 15px 2px 10px; background-color: transparent;">Save as CSV</div>');
        $menu.append($div);
        $div.mouseover(function () {
            this.style.backgroundColor = '#EEEEEE';
        });
        $div.mouseout(function () {
            this.style.backgroundColor = 'transparent';
        });
        $div.click(function () {
            jlab.wave.csvexport();
            $(this).parent().hide();
        });

        /*Options button*/
        var $btn = $('<button class="options-button" type="button" style="display: inline; position: relative; margin: 0px; padding: 3px 4px 0px; float: left;" title="Options"><img style="height: 16px;" alt="Options" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAACqjSMyAAAACXBIWXMAAASwAAAEsACQKxcwAAAA5ElEQVQoz6XRTyvDARgH8M9momXRtMPKYRMOVhxZkQuR4gU4kbwEFxcXZzd395U7JYk3YFc7yK9mopU/Wdkyh7W2n9z2vT09z/dfD72iLzRFLZoRaPx3mjUq7kbFpH6ZNrWtMKVgVdKmEVUbjtwrdfPH3Gr6URGoa3q2HDaI2Nd0alrWobqCuEhnnXOm7MEEGHLp3ZX1Vm5IWZL24Q3UVCXkZToKcbNO1GyLYkHZuTlJiIEvJQmDjq34tCbt0ZNqd8h5LwIXahquFX3bCbcYsCUv5c6rnHG7LYO/iNlzYLjnB4bwCwNoNuHs2ZotAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTA3LTI0VDE3OjAyOjUzLTA0OjAwkSlhJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wNy0yNFQxNzowMjo1My0wNDowMOB02ZgAAAAmdEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC90bXBxNTRfVlAuc3ZnVTAB7AAAAABJRU5ErkJggg=="/></button>');
        $(this).find("> :nth-child(2)").after($btn);
        $btn.click(function () {
            alert('hey oh');
        });

    });
};
jlab.wave.validateOptions = function () {
    /*Verify valid number*/
    if (jlab.wave.startDateAndTime.getTime() !== jlab.wave.startDateAndTime.getTime()) { /*Only NaN is not equal itself*/
        jlab.wave.startDateAndTime = new Date();
    }

    /*Verify valid number*/
    if (jlab.wave.endDateAndTime.getTime() !== jlab.wave.endDateAndTime.getTime()) { /*Only NaN is not equal itself*/
        jlab.wave.endDateAndTime = new Date();
    }

    /*Verify valid number*/
    if (jlab.wave.multiplePvMode !== jlab.wave.multiplePvMode) { /*Only NaN is not equal itself*/
        jlab.wave.multiplePvMode = jlab.wave.multiplePvModeEnum.SEPARATE_CHART;
    }
};
jlab.wave.deletePvs = function (pvs) {
    var uri = new URI();

    /*Note: we require pvs != jlab.wave.pvs otherwise pvs.length is modified during iteration.  We ensure this by using jlab.wave.pvs.slice*/
    pvs = pvs.slice(); /* slice (not splice) makes a copy */

    for (var i = 0; i < pvs.length; i++) {
        var pv = pvs[i],
                series = jlab.wave.pvToSeriesMap[pv],
                metadata = series.metadata,
                color = metadata.color,
                chart = series.chart,
                index = chart.pvs.indexOf(pv);

        chart.pvs.splice(index, 1);

        if (chart.pvs.length < 1) {
            jlab.wave.charts.splice(jlab.wave.charts.indexOf(chart), 1);
            chart.$placeholderDiv.remove();
            delete chart;
        }

        delete jlab.wave.pvToSeriesMap[pv];

        var index2 = jlab.wave.pvs.indexOf(pv);
        jlab.wave.pvs.splice(index2, 1);

        /*Put color back in array for re-use*/
        jlab.wave.colors.push(color);

        uri.removeQuery("pv", pv);
    }

    jlab.wave.doLayout();

    if (Object.keys(jlab.wave.pvToSeriesMap).length === 0) {
        $("#chart-container").css("border", "1px dashed black");
    }

    var url = uri.href();
    window.history.replaceState({}, 'Remove pvs: ' + pvs, url);
};
jlab.wave.multiplePvAction = function (pvs, add) {
    if (pvs.length > 0) {
        var action;

        if (add) {
            action = jlab.wave.addPv;
        } else {
            action = jlab.wave.getData;
        }

        $.mobile.loading("show", {textVisible: true, theme: "b"});

        var promises = [];

        for (var i = 0; i < pvs.length; i++) {
            var promise = action(pvs[i], true);

            promises.push(promise);
        }

        $.whenAll.apply($, promises).always(function () {
            $.mobile.loading("hide");
            jlab.wave.doLayout();
        });
    }
};

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

            jlab.wave.multiplePvAction(tokens, true); /*true means add*/
        }
        return false; /*Don't do default action*/
    }
});
$(document).on("click", ".cancel-panel-button", function () {
    $(this).closest(".ui-panel").panel("close");
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

    var fetchRequired = false,
            oldStartMillis = jlab.wave.startDateAndTime.getTime(),
            oldEndMillis = jlab.wave.endDateAndTime.getTime(),
            startDateStr = $("#start-date-input").val(),
            startTimeStr = $("#start-time-input").val(),
            endDateStr = $("#end-date-input").val(),
            endTimeStr = $("#end-time-input").val(),
            startDate = jlab.wave.parseUserDate(startDateStr),
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

    jlab.wave.validateOptions();

    if (oldStartMillis !== jlab.wave.startDateAndTime.getTime() || oldEndMillis !== jlab.wave.endDateAndTime.getTime()) {
        fetchRequired = true;
    }

    var uri = new URI();
    uri.setQuery("start", jlab.wave.toIsoDateTimeString(jlab.wave.startDateAndTime));
    uri.setQuery("end", jlab.wave.toIsoDateTimeString(jlab.wave.endDateAndTime));
    uri.setQuery("multiplePvMode", jlab.wave.multiplePvMode);
    window.history.replaceState({}, 'Set start and end', uri.href());

    if (fetchRequired) {
        jlab.wave.refresh();
    } else {
        jlab.wave.doLayout();
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

        if (uri.hasQuery("multiplePvMode")) {
            jlab.wave.multiplePvMode = parseInt(queryMap["multiplePvMode"]);
        } else {
            var url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {multiplePvMode: jlab.wave.multiplePvMode});
            window.history.replaceState({}, 'Set multiple PV Mode: ' + jlab.wave.multiplePvMode, url);
        }

        jlab.wave.validateOptions();

        var pvs = queryMap["pv"] || [];
        if (!Array.isArray(pvs)) {
            pvs = [pvs];
        }

        jlab.wave.multiplePvAction(pvs, true); /*true means add*/

        /*Don't register resize event until after page load*/
        $(window).on("resize", function () {
            console.log("window resize");
            /*var pageHeight = $(window).height();
             console.log(pageHeight);*/
            jlab.wave.doLayout();
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
        jlab.wave.deletePvs([e.dataSeries.pv]);
        $("#pv-panel").panel("close");

    }
});

/* PAGE READY EVENT */

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

/* DATE-TIME-CHOOSER CONFIGURATION */

jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
    'maxDur': 86399,
    'lockInput': false
});
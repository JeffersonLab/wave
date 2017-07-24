var jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
jlab.wave.multiplePvModeEnum = {SEPARATE_CHART: 1, SAME_CHART_SAME_AXIS: 2, SAME_CHART_SEPARATE_AXIS: 3};
jlab.wave.pvToChartMap = {};
jlab.wave.pvToMetadataMap = {};
jlab.wave.pvToDataMap = {};
jlab.wave.idToChartMap = {};
jlab.wave.pvs = [];
jlab.wave.chartIdSequence = 0;
jlab.wave.selectedSeries; /*When you click on series label in legend*/
/*http://colorbrewer2.org/#type=qualitative&scheme=Paired&n=5*/
jlab.wave.colors = ['#33a02c', '#1f78b4', '#fb9a99', '#a6cee3', '#b2df8a']; /*Make sure at least as many as MAX_PVS*/
/*jlab.wave.MAX_POINTS = 200;*/
jlab.wave.MAX_PVS = 5; /*Max Charts too*/
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
jlab.wave.toDynamicDateTimeRangeInfo = function (start, end) {
    var sameYear = false,
            sameMonth = false,
            sameDay = false,
            oneDaySpecial = false,
            oneMonthSpecial = false,
            oneYearSpecial = false,
            startTimeNonZero = false,
            endTimeNonZero = false,
            formattedTime = '',
            formattedStartDate,
            formattedEndDate,
            result;

    if (start.getHours() !== 0 || start.getMinutes() !== 0 || start.getSeconds() !== 0) {
        startTimeNonZero = true;
    }

    if (end.getHours() !== 0 || end.getMinutes() !== 0 || end.getSeconds() !== 0) {
        endTimeNonZero = true;
    }

    if (startTimeNonZero || endTimeNonZero) {
        formattedTime = ' (' + jlab.wave.toUserTimeString(start) + ' - ' + jlab.wave.toUserTimeString(end) + ')';
    } else { /*Check for no-time special cases*/
        var d = new Date(start.getTime());
        d.setDate(start.getDate() + 1);
        oneDaySpecial = d.getTime() === end.getTime();

        if (!oneDaySpecial && start.getDate() === 1) { /*Check for one month special*/
            d = new Date(start.getTime());
            d.setMonth(start.getMonth() + 1);
            oneMonthSpecial = d.getTime() === end.getTime();

            if (!oneMonthSpecial && start.getMonth() === 0) { /*Check for one year special*/
                d = new Date(start.getTime());
                d.setFullYear(start.getFullYear() + 1);
                oneYearSpecial = d.getTime() === end.getTime();
            }
        }
    }

    sameYear = start.getFullYear() === end.getFullYear();
    sameMonth = sameYear ? start.getMonth() === end.getMonth() : false;
    sameDay = sameMonth ? start.getDate() === end.getDate() : false;

    if (oneDaySpecial) {
        result = jlab.wave.fullMonthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
    } else if (oneMonthSpecial) {
        result = jlab.wave.fullMonthNames[start.getMonth()] + ' ' + start.getFullYear();
    } else if (oneYearSpecial) {
        result = start.getFullYear();
    } else {
        if (sameYear) {
            formattedStartDate = jlab.wave.fullMonthNames[start.getMonth()] + ' ' + start.getDate();

            if (sameMonth) {
                if (sameDay) {
                    formattedEndDate = ', ' + end.getFullYear();
                } else { /*Days differ*/
                    formattedEndDate = ' - ' + end.getDate() + ', ' + end.getFullYear();
                }
            } else { /*Months differ*/
                formattedEndDate = ' - ' + jlab.wave.fullMonthNames[end.getMonth()] + ' ' + end.getDate() + ', ' + end.getFullYear();
            }
        } else { /*Years differ*/
            formattedStartDate = jlab.wave.fullMonthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
            formattedEndDate = ' - ' + jlab.wave.fullMonthNames[end.getMonth()] + ' ' + end.getDate() + ', ' + end.getFullYear();
        }

        result = formattedStartDate + formattedEndDate + formattedTime;
    }

    return {rangeString: result, impliedYear: sameYear || oneYearSpecial, impliedYearMonth: sameMonth || oneMonthSpecial, impliedYearMonthDay: sameDay || oneDaySpecial};
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
jlab.wave.zoomRangeChange = function (e) {
    var viewportMinimum = e.axisX[0].viewportMinimum,
            viewportMaximum = e.axisX[0].viewportMaximum,
            timeInfo = e.chart.options.timeInfo;

    if (!e.chart.options.axisX)
        e.chart.options.axisX = {};

    if (e.trigger === "reset") {
        e.chart.options.axisX.valueFormatString = e.chart.options.baseXAxisFormat;
    } else if (e.trigger === "zoom") {
        e.chart.options.axisX.valueFormatString = jlab.wave.dynamicXAxisFormatter(viewportMinimum, viewportMaximum, timeInfo);
    }
};
jlab.wave.dynamicXAxisFormatter = function (minMillis, maxMillis, timeInfo) {
    var formatter = {year: false, month: false, day: false, hour: false, minute: false, second: false};

    if (!timeInfo.impliedYear) {
        formatter.year = true;
    }

    if (!timeInfo.impliedYearMonth) {
        formatter.month = true;
    }

    if (!timeInfo.impliedYearMonthDay) {
        formatter.day = true;
    }

    var millisPerMinute = 1000 * 60, /*Ignore leap seconds as timestamps from Epoch do*/
            millisPerHour = millisPerMinute * 60,
            millisPerDay = millisPerHour * 24, /*UTC - no timezone - no daylight savings*/
            millisPerMonth = millisPerDay * 30, /*Approximate*/
            millisPerYear = millisPerMonth * 12,
            rangeMillis = (maxMillis - minMillis);

    // Less than a few minutes
    if ((rangeMillis / millisPerMinute) < 5) {
        formatter.hour = true;
        formatter.minute = true;
        formatter.second = true;
    }
    // Less than a few hours
    else if ((rangeMillis / millisPerHour) < 12) {
        formatter.hour = true;
        formatter.minute = true;
    }
    // Less than a few days
    else if (rangeMillis / (millisPerDay) < 7) {
        formatter.hour = true;
    }
    // Less than a few months
    else if ((rangeMillis / millisPerMonth) < 6) {
        formatter.day = true;
    }
    // Less than a few years
    else if ((rangeMillis / millisPerYear) < 3) {
        formatter.month = true;
    }
    
    var result = "";
    
    if(formatter.month) {
        result = result + "MMM";
    }
    
    if(formatter.day) {
        result = result + " DD";
    }
    
    if(formatter.year) {
        result = result + " YYYY";
    }
    
    if(formatter.hour || formatter.minute) {
        result = result + " HH:mm";
    }
    
    if(formatter.second) {
        result = result + ":ss";
    }
    
    result = result.trim();
    
    return result;
};
jlab.wave.Chart = function (pvs) {
    this.pvs = pvs;
    this.canvasjsChart = null;
    this.$placeholderDiv = null;

    jlab.wave.Chart.prototype.createCanvasJsChart = function (separateYAxis) {
        var chartId = 'chart-' + jlab.wave.chartIdSequence++,
                labels = [],
                data = [],
                axisY = [];

        if (!separateYAxis) {
            axisY.push({
                title: '',
                margin: 40,
                tickLength: 20,
                includeZero: false
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
                axisY.push({title: pv + ' Value', margin: 40, tickLength: 20, includeZero: false, lineColor: jlab.wave.colors[colorIndex], labelFontColor: jlab.wave.colors[colorIndex], titleFontColor: jlab.wave.colors[colorIndex]});
            }

            data.push({pv: pv, xValueFormatString: "MMM DD YYYY HH:mm:ss", toolTipContent: "{x}, <b>{y}</b>", showInLegend: true, legendText: labels[i], axisYindex: axisYIndex, color: jlab.wave.colors[colorIndex], type: "line", lineDashType: lineDashType, markerType: "none", xValueType: "dateTime", dataPoints: jlab.wave.pvToDataMap[pvs[i]]});

            jlab.wave.pvToChartMap[pv] = this;
        }

        var title = labels[0];

        for (var i = 1; i < labels.length; i++) {
            title = title + ", " + labels[i];
        }

        this.$placeholderDiv = $('<div id="' + chartId + '" class="chart"></div>');
        jlab.wave.chartHolder.append(this.$placeholderDiv);
        jlab.wave.idToChartMap[chartId] = this;
        var minDate = jlab.wave.startDateAndTime,
                maxDate = jlab.wave.endDateAndTime,
                timeInfo = jlab.wave.toDynamicDateTimeRangeInfo(minDate, maxDate),
                baseXAxisFormat = jlab.wave.dynamicXAxisFormatter(minDate.getTime(), maxDate.getTime(), timeInfo);

        this.canvasjsChart = new CanvasJS.Chart(chartId, {
            zoomEnabled: true,
            exportEnabled: true,
            rangeChanging: jlab.wave.zoomRangeChange,
            timeInfo: timeInfo,
            baseXAxisFormat: baseXAxisFormat,
            title: {
                text: timeInfo.rangeString
                        /*text: jlab.wave.toUserDateTimeString(jlab.wave.startDateAndTime) + ' - ' + jlab.wave.toUserDateTimeString(jlab.wave.endDateAndTime)*/
            },
            legend: {
                horizontalAlign: "center",
                verticalAlign: "top",
                cursor: "pointer",
                itemclick: function (e) {
                    jlab.wave.selectedSeries = e;

                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        $("#pv-visibility-toggle-button").text("Hide");
                    } else {
                        $("#pv-visibility-toggle-button").text("Show");
                    }

                    $("#pv-panel h2").text(e.dataSeries.pv);

                    /*BEGIN PART THAT COULD BE DEFERRED*/
                    $("#metadata-popup h2").text(e.dataSeries.pv);
                    var metadata = jlab.wave.pvToMetadataMap[e.dataSeries.pv];
                    $("#metadata-datatype").text(metadata.datatype);
                    $("#metadata-host").text(metadata.datahost);
                    $("#metadata-count").text(jlab.wave.intToStringWithCommas(metadata.count));
                    $("#metadata-sampled").text(metadata.sampled);
                    $("#metadata-sampled-count").text(jlab.wave.intToStringWithCommas(metadata.sampledcount));
                    $("#metadata-stepped-count").text(jlab.wave.intToStringWithCommas(metadata.steppedcount));
                    /*END PART THAT COULD BE DEFERRED*/

                    $("#pv-panel").panel("open");
                },
                itemmouseover: function (e) {
                    $(e.chart._canvasJSContainer).attr("title", "PV Menu");

                    /*Sure would be nice to change style of label, but it is too slow since it renders entire chart again*/

                    /*e.chart.legend.set("fontColor", 'white');
                     e.chart.legend.set("backgroundColor", 'black');
                     e.chart.legend.set("borderColor", 'gray');
                     e.chart.legend.set("borderThickness", 1);
                     e.chart.legend.set("fontStyle", 'italic');
                     e.chart.legend.set("fontWeight", 'bold');
                     console.time("legend render");
                     e.chart.render();
                     console.timeEnd("legend render");*/
                },
                itemmouseout: function (e) {
                    $(e.chart._canvasJSContainer).removeAttr("title");
                    /*e.chart.legend.set("fontColor", 'black');
                     e.chart.legend.set("backgroundColor", 'transparent');
                     e.chart.legend.set("borderColor", 'transparent');
                     e.chart.legend.set("borderThickness", 0);
                     e.chart.legend.set("fontStyle", 'normal');
                     e.chart.legend.set("fontWeight", 'normal'); 
                     e.chart.render();*/
                }
            },
            axisY: axisY,
            axisX: {
                tickLength: 20,
                valueFormatString: baseXAxisFormat,
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

        jlab.wave.pvToMetadataMap[pv] = {'datatype': json.datatype, 'datasize': json.datasize, 'datahost': json.datahost, 'sampled': json.sampled, 'count': json.count, 'sampledcount': json.sampled ? json.data.length : 'N/A', 'steppedcount': formattedData.length};

        jlab.wave.pvToDataMap[pv] = formattedData;

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
        if (jlab.wave.pvToDataMap[pv].length === 0) {
            jlab.wave.pvToDataMap[pv] = [{x: jlab.wave.startDateAndTime, y: 0, markerType: 'cross', markerColor: 'red', markerSize: 12, toolTipContent: pv + ": NO DATA"}];
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
        var c = new jlab.wave.Chart(jlab.wave.pvs),
                $placeholderDiv = c.createCanvasJsChart(jlab.wave.multiplePvMode === jlab.wave.multiplePvModeEnum.SAME_CHART_SEPARATE_AXIS);
        $placeholderDiv.css("top", 0);
        $placeholderDiv.height(jlab.wave.chartHolder.height());

        console.time("render");
        c.canvasjsChart.render();
        console.timeEnd("render");

        jlab.wave.addCsvButton();
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

        jlab.wave.addCsvButton();
    }
};
jlab.wave.csvexport = function () {
    var data = '',
            filename = 'chart.csv',
            type = 'text/csv';

    /*TODO: figure out which chart is being export and only get pvs from it*/
    for (var i = 0; i < jlab.wave.pvs.length; i++) {
        var pv = jlab.wave.pvs[i],
                series = jlab.wave.pvToDataMap[pv];

        data = data + '--- ' + pv + ' ---\r\n';
        for (var j = 0; j < series.length; j++) {
            if (!(j % 2)) { /*Only output even to skip stepped points */
                data = data + jlab.wave.toIsoDateTimeString(new Date(series[j].x)) + ',' + series[j].y + '\r\n';
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
jlab.wave.addCsvButton = function () {
    $(".csv-menu-item").remove();
    $(".canvasjs-chart-toolbar > div").each(function () {
        var $div = $('<div class="csv-menu-item" style="padding: 2px 15px 2px 10px; background-color: transparent;">Save as CSV</div>');
        $(this).append($div);
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
        var pv = pvs[i];

        var chart = jlab.wave.pvToChartMap[pv];
        var index = chart.pvs.indexOf(pv);
        chart.pvs.splice(index, 1);

        if (chart.pvs.length < 1) {
            console.log('deleting chart');
            chart.$placeholderDiv.remove();
            delete chart;
        }

        delete jlab.wave.pvToChartMap[pv];
        delete jlab.wave.pvToDataMap[pv];
        delete jlab.wave.pvToMetadataMap[pv];

        var index2 = jlab.wave.pvs.indexOf(pv);
        jlab.wave.pvs.splice(index2, 1);

        uri.removeQuery("pv", pv);
    }

    jlab.wave.doLayout();

    if (Object.keys(jlab.wave.pvToChartMap).length === 0) {
        $("#chart-container").css("border", "1px dashed black");
    }

    var url = uri.href();
    window.history.replaceState({}, 'Remove pvs: ' + pvs, url);
};
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
});
$(document).on("click", "#pv-delete-button", function () {
    var e = jlab.wave.selectedSeries;

    if (typeof jlab.wave.selectedSeries !== 'undefined') {
        jlab.wave.deletePvs([e.dataSeries.pv]);
        $("#pv-panel").panel("close");

    }
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
jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
    'maxDur': 86399,
    'lockInput': false
});
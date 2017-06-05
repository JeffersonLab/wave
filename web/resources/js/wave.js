var jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.pvToChartMap = {};
jlab.wave.MAX_POINTS = 200;
jlab.wave.MAX_CHARTS = 5;

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

    var minDate = new Date(),
            maxDate = new Date();

    minDate.setMinutes(minDate.getMinutes() - 1);

    var $placeholder = $div.find(".chart-body"),
            plot = $.plot($placeholder, [[]], {
                legend: {
                    show: false  
                },
                series: {
                    lines: {
                        show: true,
                        steps: true
                    },
                    points: {
                        show: false
                    }
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
            data = {c: c.pv},
    dataType = "json",
            options = {url: url, type: 'GET', data: data, dataType: dataType};

    if (url.indexOf("/") !== 0) {
        dataType = "jsonp";
        options.dataType = dataType;
        options.jsonp = 'jsonp';
    }

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
                /*flotFormattedData.push([timestamp, prev]);*/ /*Let's try the built-in step feature of flot instead*/
            }

            flotFormattedData.push(point);

            prev = value;
        }

        /*console.log(flotFormattedData);*/

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
    $( "#options-panel" ).panel("open");
});

$(document).on("keyup", "#pv-input", function (e) {
    if (e.keyCode === 13) {
        $("#go-button").click();
        return false; /*Don't do default action*/
    }
});

$(window).on("resize", function() {
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
    $("#header-panel").toolbar({theme: "a", tapToggle: false});
    $("#footer-panel").toolbar({theme: "a", tapToggle: false});
});
var jlab = jlab || {};
jlab.wave = jlab.wave || {};

/**
 * Constructor for LayoutManager object. 
 * 
 * A wave LayoutManager encapsulates all of the tasks for laying out the charts, 
 * but delegates the actual rendering of canvases to CanvasJS.
 * 
 * @param $chartSetDiv - The jQuery wrapped div container for a set of charts
 * @param multiplePvMode - The layout mode
 */
jlab.wave.LayoutManager = function ($chartSetDiv, multiplePvMode) {
    this.$chartSetDiv = $chartSetDiv;
    this.multiplePvMode = multiplePvMode;

    /* var functions don't have this set as expected (this.function do though) */
    var self = this;

    /** 
     * Sequence ID generator for charts (canvas JS requires DOM placeholder div
     * has ID) 
     **/
    var chartNextSequenceId = 0;

    /*Priviledged visibility*/
    this.doLayout = function () {
        $chartSetDiv.empty();

        /*console.log('doLayout');
         console.log('pvs: ' + jlab.wave.pvs);*/

        if (this.multiplePvMode === jlab.wave.multiplePvModeEnum.SEPARATE_CHART) {
            doSeparateChartLayout();
        } else {
            doSingleChartLayout();
        }
    };
    /*Private visibility*/
    var createAndAppendChartPlaceholder = function () {
        var chartId = 'chart-' + chartNextSequenceId++,
                $placeholderDiv = $('<div id="' + chartId + '" class="chart"></div>');
        $chartSetDiv.append($placeholderDiv);
        return $placeholderDiv;
    };
    /*Private visibility*/
    var updateChartToolbars = function () {
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
                jlab.wave.controller.csvexport();
                $(this).parent().hide();
            });

            /*Options button*/
            /*var $btn = $('<button class="options-button" type="button" style="display: inline; position: relative; margin: 0px; padding: 3px 4px 0px; float: left;" title="Options"><img style="height: 16px;" alt="Options" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAACqjSMyAAAACXBIWXMAAASwAAAEsACQKxcwAAAA5ElEQVQoz6XRTyvDARgH8M9momXRtMPKYRMOVhxZkQuR4gU4kbwEFxcXZzd395U7JYk3YFc7yK9mopU/Wdkyh7W2n9z2vT09z/dfD72iLzRFLZoRaPx3mjUq7kbFpH6ZNrWtMKVgVdKmEVUbjtwrdfPH3Gr6URGoa3q2HDaI2Nd0alrWobqCuEhnnXOm7MEEGHLp3ZX1Vm5IWZL24Q3UVCXkZToKcbNO1GyLYkHZuTlJiIEvJQmDjq34tCbt0ZNqd8h5LwIXahquFX3bCbcYsCUv5c6rnHG7LYO/iNlzYLjnB4bwCwNoNuHs2ZotAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTA3LTI0VDE3OjAyOjUzLTA0OjAwkSlhJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wNy0yNFQxNzowMjo1My0wNDowMOB02ZgAAAAmdEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC90bXBxNTRfVlAuc3ZnVTAB7AAAAABJRU5ErkJggg=="/></button>');
            $(this).find("> :nth-child(2)").after($btn);
            $btn.click(function () {
                alert('hey oh');
            });*/
        });
    };
    /*Private visibility*/
    var doSingleChartLayout = function () {
        if (jlab.wave.pvs.length > 0) {

            var $placeholderDiv = createAndAppendChartPlaceholder(),
                    c = new jlab.wave.Chart(jlab.wave.pvs, $placeholderDiv, (self.multiplePvMode === jlab.wave.multiplePvModeEnum.SAME_CHART_SEPARATE_AXIS));

            $placeholderDiv.css("top", 0);
            $placeholderDiv.height($chartSetDiv.height());

            console.time("render");
            c.canvasjsChart.render();
            console.timeEnd("render");

            updateChartToolbars();
        }
    };
    /*Private visibility*/
    var doSeparateChartLayout = function () {
        var offset = 0;

        for (var i = 0; i < jlab.wave.pvs.length; i++) {

            var $placeholderDiv = createAndAppendChartPlaceholder(),
                    pv = jlab.wave.pvs[i],
                    c = new jlab.wave.Chart([pv], $placeholderDiv),
                    chartHeight = $chartSetDiv.height() / jlab.wave.pvs.length;

            $placeholderDiv.css("top", offset);
            offset = offset + chartHeight;
            $placeholderDiv.height(chartHeight);

            console.time("render");
            c.canvasjsChart.render();
            console.timeEnd("render");

            updateChartToolbars();
        }
    };
};
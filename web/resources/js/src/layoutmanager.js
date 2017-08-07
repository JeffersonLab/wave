/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {

        /**
         * A wave LayoutManager encapsulates all of the tasks for laying out the charts, 
         * but delegates the actual rendering of canvases to CanvasJS.
         * 
         * @param $chartSetDiv - The jQuery wrapped div container for a set of charts
         * @param multiplePvMode - The layout mode
         */
        let LayoutManager = class LayoutManager {
            constructor(chartManager) {
                let _chartManager = chartManager;

                LayoutManager.prototype.doLayout = function () {
                    _chartManager.getOptions().$chartSetDiv.empty();
                };

                /** 
                 * Sequence ID generator for charts (canvas JS requires DOM placeholder div
                 * has ID) 
                 **/
                this.chartNextSequenceId = 0;

                this.createAndAppendChartPlaceholder = function () {
                    let chartId = 'chart-' + this.chartNextSequenceId++,
                            $placeholderDiv = $('<div id="' + chartId + '" class="chart"></div>');
                    _chartManager.getOptions().$chartSetDiv.append($placeholderDiv);
                    return $placeholderDiv;
                };
                /*Private visibility*/
                this.updateChartToolbars = function () {
                    $(".csv-menu-item, .options-button").remove();
                    $(".canvasjs-chart-toolbar").each(function () {
                        /*CSV menu item*/
                        let $menu = $(this).find("> div");
                        let $div = $('<div class="csv-menu-item" style="padding: 2px 15px 2px 10px; background-color: transparent;">Save as CSV</div>');
                        $menu.append($div);
                        $div.mouseover(function () {
                            this.style.backgroundColor = '#EEEEEE';
                        });
                        $div.mouseout(function () {
                            this.style.backgroundColor = 'transparent';
                        });
                        $div.click(function () {
                            _chartManager.csvexport();
                            $(this).parent().hide();
                        });

                        /*Options button*/
                        /*let $btn = $('<button class="options-button" type="button" style="display: inline; position: relative; margin: 0px; padding: 3px 4px 0px; float: left;" title="Options"><img style="height: 16px;" alt="Options" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAACqjSMyAAAACXBIWXMAAASwAAAEsACQKxcwAAAA5ElEQVQoz6XRTyvDARgH8M9momXRtMPKYRMOVhxZkQuR4gU4kbwEFxcXZzd395U7JYk3YFc7yK9mopU/Wdkyh7W2n9z2vT09z/dfD72iLzRFLZoRaPx3mjUq7kbFpH6ZNrWtMKVgVdKmEVUbjtwrdfPH3Gr6URGoa3q2HDaI2Nd0alrWobqCuEhnnXOm7MEEGHLp3ZX1Vm5IWZL24Q3UVCXkZToKcbNO1GyLYkHZuTlJiIEvJQmDjq34tCbt0ZNqd8h5LwIXahquFX3bCbcYsCUv5c6rnHG7LYO/iNlzYLjnB4bwCwNoNuHs2ZotAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTA3LTI0VDE3OjAyOjUzLTA0OjAwkSlhJAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wNy0yNFQxNzowMjo1My0wNDowMOB02ZgAAAAmdEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC90bXBxNTRfVlAuc3ZnVTAB7AAAAABJRU5ErkJggg=="/></button>');
                         $(this).find("> :nth-child(2)").after($btn);
                         $btn.click(function () {
                         alert('hey oh');
                         });*/
                    });
                };
            }
        }

        wave.SingleChartLayoutManager = class SingleChartLayoutManager extends LayoutManager {
            constructor(chartManager) {
                super(chartManager);

                let _chartManager = chartManager;

                wave.SingleChartLayoutManager.prototype.doLayout = function () {
                    LayoutManager.prototype.doLayout();

                    if (_chartManager.getPvs().length > 0) {

                        let $placeholderDiv = this.createAndAppendChartPlaceholder(),
                                c = new wave.Chart(_chartManager, _chartManager.getPvs(), $placeholderDiv, (_chartManager.getOptions().layoutMode === wave.layoutModeEnum.SAME_CHART_SEPARATE_AXIS));

                        $placeholderDiv.css("top", 0);
                        $placeholderDiv.height(_chartManager.getOptions().$chartSetDiv.height());

                        console.time("render");
                        c.canvasjsChart.render();
                        console.timeEnd("render");

                        this.updateChartToolbars();
                    }
                };
            }
        };

        wave.SeparateChartLayoutManager = class SeparateChartLayoutManager extends LayoutManager {
            constructor(chartManager) {
                super(chartManager);

                let _chartManager = chartManager;

                wave.SeparateChartLayoutManager.prototype.doLayout = function () {
                    LayoutManager.prototype.doLayout();

                    let offset = 0;
                    let pvs = _chartManager.getPvs();

                    for (let i = 0; i < pvs.length; i++) {
                        let $placeholderDiv = this.createAndAppendChartPlaceholder(),
                                pv = pvs[i],
                                c = new wave.Chart(_chartManager, [pv], $placeholderDiv),
                                chartHeight = _chartManager.getOptions().$chartSetDiv.height() / pvs.length;

                        $placeholderDiv.css("top", offset);
                        offset = offset + chartHeight;
                        $placeholderDiv.height(chartHeight);

                        console.time("render");
                        c.canvasjsChart.render();
                        console.timeEnd("render");

                        this.updateChartToolbars();
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
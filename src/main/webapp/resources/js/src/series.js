/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.Series = class Series {
            /**
             * A wave Series encapsulates all of the information associated with a PV.
             * 
             * @param {string} pv - The PV name
             * @returns {jlab.wave.Series} - The series
             */
            constructor(pv) {
                this.pv = pv;
                this.data = null; /* Array of X,Y values */
                this.chart = null; /* Reference to jlab.wave.Chart */
                this.chartSeriesIndex = null; /*Index into chart data*/
                this.metadata = null; /* Object */
                this.preferences = {color: null, label: null, yAxisLabel: null, yAxisMin: null, yAxisMax: null, scaler: null, yAxisLog: false}; /* Unlike metadata, this is maintained across fetch refreshes */
                this.error = null; /* Series error message */

                const MAX_STRIPCHART_POINTS = 100;

                let prev = this.data !== null && this.data.length > 0 ? this.data[this.data.length - 1] : null;

                this.addSteppedPoint = function (point, lastUpdated) {
                    if (this.data === null) {
                        this.data = [];
                    }


                    if (point !== undefined) {
                        if (this.data.length >= MAX_STRIPCHART_POINTS) {
                            /*this.data = this.data.slice(2);*/
                            this.data.splice(0, 1);
                        }

                        if (prev !== null) {
                            this.data.push({x: lastUpdated.getTime(), y: prev.y});
                        }

                        prev = {x: lastUpdated.getTime(), y: point};

                        this.data.push({x: lastUpdated.getTime(), y: point});
                    }

                    this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                    this.chart.canvasjsChart.render();
                };

                this.addExtensionPoint = function (lastUpdated) {
                    if (this.data === null) {
                        this.data = [];
                    } else if (this.data.length > 1) {
                        if (this.data.length >= MAX_STRIPCHART_POINTS) {
                            /*this.data = this.data.slice(2);*/
                            this.data.splice(0, 1);
                        }

                        let point = this.data[this.data.length - 1];

                        if (this.data.length > 2 && this.data[this.data.length - 2].y === point.y) {
                            this.data[this.data.length - 1].x = lastUpdated.getTime();
                        } else {
                            this.data.push({x: lastUpdated.getTime(), y: point.y});
                            /*console.log(point);*/
                        }

                        this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                        this.chart.canvasjsChart.render();
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
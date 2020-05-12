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
                this.data = []; /* Array of X,Y values */
                this.chart = null; /* Reference to jlab.wave.Chart */
                this.chartSeriesIndex = null; /*Index into chart data*/
                this.metadata = {}; /* Object */
                this.preferences = {color: null, label: null, yAxisLabel: null, yAxisMin: null, yAxisMax: null, scaler: null, yAxisLog: null}; /* Unlike metadata, this is maintained across fetch refreshes */
                this.error = null; /* Series error message */
                this.fractionDigits = 0;

                let prev = this.data !== null && this.data.length > 0 ? this.data[this.data.length - 1] : null;

                this.calculateFractionDigits = function() {
                    let diff = (this.metadata.max || 0) - (this.metadata.min || 0),
                        base10 = diff === 0 ? 0 : Math.log10(diff);
                    this.fractionDigits = Math.ceil(Math.abs(base10)) + 1;

                    /*console.log("diff: ", diff, "base10: ", base10, "max: ", this.metadata.max, "min: ", this.metadata.min, 'digits: ', this.fractionDigits);*/
                }

                this.addSteppedPoint = function (point, lastUpdated) {
                    if (this.data === null) {
                        this.data = [];
                    }

                    if (point !== undefined) {
                        if (this.data.length >= wave.MAX_STRIPCHART_POINTS) {
                            this.data.splice(0, 2); // Remove first two points, since we add two points!
                        }

                        if (prev !== null) {
                            this.data.push({x: lastUpdated.getTime(), y: prev.y});
                        }

                        prev = {x: lastUpdated.getTime(), y: point};

                        this.data.push({x: lastUpdated.getTime(), y: point});
                    }

                    this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                };

                this.addExtensionPoint = function (lastUpdated, num) {
                    if (this.data === null) {
                        this.data = [];
                    } else if (this.data.length > 0) {
                        if (this.data.length >= wave.MAX_STRIPCHART_POINTS) {
                            this.data.shift();
                        }

                        let point = this.data[this.data.length - 1];

                        /*This is way more efficient, but tick generator algorithm won't match...*/
                        /*if (this.data.length > 2 && this.data[this.data.length - 2].y === point.y) {
                            this.data[this.data.length - 1].x = lastUpdated.getTime();
                        } else {
                            this.data.push({x: lastUpdated.getTime(), y: point.y});
                        }*/

                        /*Inefficient, but ticks now line up*/
                        for(var i = 0; i < num; i++) {
                            this.data.push({x: lastUpdated.getTime(), y: point.y});
                        }

                        this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
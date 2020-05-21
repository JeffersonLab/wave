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
                this.exponentialFormat = false;

                let prev = this.data !== null && this.data.length > 0 ? this.data[this.data.length - 1] : null;

                this.calculateFractionDigits = function() {
                    let max = this.metadata.max || 0,
                        min = this.metadata.min || 0,
                        diff = max - min,
                        numTicks = 5, /*An estimate*/
                        tickDiff = diff / numTicks, /*Difference between ticks*/
                        /*base10 = diff === 0 ? 0 : Math.log10(diff),*/
                        tickBase10 = tickDiff === 0 ? 0 : Math.log10(tickDiff),
                        decimal = tickBase10 < 0, /*If log is negative, then diff is fractional*/
                        magnitude = Math.abs(diff),
                        largeMagnitude = magnitude > 0 && (magnitude < 0.0001 || magnitude > 10000);

                    if(decimal) {
                        this.fractionDigits = Math.ceil(Math.abs(tickBase10));
                    } else {
                        this.fractionDigits = 0;
                    }

                    if(largeMagnitude && (this.preferences.yAxisLog || tickDiff > 1000)) {
                        this.exponentialFormat = true;
                        this.fractionDigits = 0;
                    } else {
                        this.exponentialFormat = false;
                    }

                    /*console.log("diff: ", diff, "base10: ", base10, "max: ", this.metadata.max, "min: ", this.metadata.min, 'digits: ', this.fractionDigits);*/
                }

                this.addSteppedPoint = function (point, lastUpdated, options) {
                    if (this.data === null) {
                        this.data = [];
                    }

                    if (point !== undefined) {
                        if (prev !== null) {
                            this.data.push({x: lastUpdated.getTime(), y: prev.y});
                        }

                        prev = {x: lastUpdated.getTime(), y: point};

                        this.data.push({x: lastUpdated.getTime(), y: point});
                    }

                    this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                };

                this.trimOldPoints = function() {
                    let oldestUnixTime = wave.windowStart.getTime(),
                        numToRemove = 0;

                    /* Find points older than start of sliding window */
                    for(var i = 0; i < this.data.length; i++) {
                        var p = this.data[i];

                        if(p.x < oldestUnixTime) {
                            numToRemove++;
                        } else {
                            break;
                        }
                    }

                    if(numToRemove > 0) {
                        /*Even smarter would be to simply change x and y of last-to-be-removed instead of removing/adding point?*/
                        let newFirstPoint = {x: oldestUnixTime, y: this.data[numToRemove - 1].y};

                        this.data.splice(0, numToRemove);

                        /*If you remove leading points, you must ensure point exists at window start*/
                        this.data.unshift(newFirstPoint);
                    }
                };

                /*If multiple series, you don't want one falling behind, plus nice to see series grow even if only one*/
                this.addExtensionPoint = function (lastUpdated) {
                    if (this.data === null) {
                        this.data = [];
                    } else if (this.data.length > 0) {

                        let point = this.data[this.data.length - 1];

                        if (this.data.length > 2 && this.data[this.data.length - 2].y === point.y) {
                            this.data[this.data.length - 1].x = lastUpdated.getTime();
                        } else {
                            this.data.push({x: lastUpdated.getTime(), y: point.y});
                        }

                        this.chart.canvasjsChart.options.data[this.chartSeriesIndex].dataPoints = this.data;
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
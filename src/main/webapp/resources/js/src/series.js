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
                        let windowMinutes = options.liveWindowMinutes || 30;
                        let oldestTime = new Date();
                        oldestTime.setMinutes(oldestTime.getMinutes() - windowMinutes);

                        let oldestUnixTime = oldestTime.getTime(),
                            numToRemove = 0;

                        for(var i = 0; i < this.data.length; i++) {
                            var p = this.data[i];

                            if(p.x < oldestUnixTime) {
                                numToRemove++;
                            } else {
                                break;
                            }
                        }

                        if(numToRemove > 0) {
                            this.data.slice(0, numToRemove);
                        }


                        if (prev !== null) {
                            this.data.push({x: lastUpdated.getTime(), y: prev.y, source: 'ca'});
                        }

                        prev = {x: lastUpdated.getTime(), y: point};

                        this.data.push({x: lastUpdated.getTime(), y: point, source: 'ca'});
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
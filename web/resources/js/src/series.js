/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /**
         * A wave Series encapsulates all of the information associated with a PV.
         * 
         * @param {string} pv - The PV name
         * @returns {jlab.wave.Series} - The series
         */
        wave.Series = class Series {
            constructor(pv) {
                this.pv = pv;
                this.data = null; /* Array of X,Y values */
                this.chart = null; /* Reference to jlab.wave.Chart */
                this.metadata = null; /* Object */
                this.preferences = null; /* Unlike metadata, this is maintained across fetch refreshes */

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
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
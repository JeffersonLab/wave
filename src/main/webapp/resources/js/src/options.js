/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.ApplicationOptions = class ApplicationOptions {
            constructor() {
                this.viewerMode = wave.viewerModeEnum.ARCHIVE;
                this.layoutMode = wave.layoutModeEnum.SEPARATE_CHART;
                this.start = new Date();
                this.end = new Date(this.start.getTime());

                this.start.setMinutes(this.start.getMinutes() - 5);

                this.$chartSetDiv = $("#chart-container");

                this.validate = function () {
                    /*Verify valid number*/
                    if (this.start.getTime() !== this.start.getTime()) { /*Only NaN is not equal itself*/
                        this.start = new Date();
                    }

                    /*Verify valid number*/
                    if (this.end.getTime() !== this.end.getTime()) { /*Only NaN is not equal itself*/
                        this.end = new Date();
                    }

                    /*Verify valid number*/
                    if (this.layoutMode !== this.layoutMode) { /*Only NaN is not equal itself*/
                        this.layoutMode = wave.layoutModeEnum.SEPARATE_CHART;
                    }

                    /*Verify valid number*/
                    if (this.viewerMode !== this.viewerMode) { /*Only NaN is not equal itself*/
                        this.viewerMode = wave.viewerModeEnum.ARCHIVE;
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
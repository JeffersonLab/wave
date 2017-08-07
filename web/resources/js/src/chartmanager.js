/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.ChartManager = class ChartManager {

            constructor(options, pvs) {
                let _options = options;

                let self = this; /*private functions don't see this as expected*/

                _options.validate();

                this.getOptions = function () {
                    return _options;
                };

                this.setOptions = function (options) {
                    let _old = _options,
                            fetchRequired = false;

                    _options = options;

                    _options.validate();

                    updateLayoutManager();
                    updateViewer();

                    if (_options.viewerMode !== _old.viewerMode) {
                        fetchRequired = true;
                    }

                    if (_old.start.getTime() !== _options.start.getTime() || _old.end.getTime() !== _options.end.getTime()) {
                        fetchRequired = true;
                    }

                    if (fetchRequired) {
                        _viewer.refresh();
                    } else {
                        _viewer.doLayout();
                    }
                };

                const MAX_POINTS_PER_SERIES = 100000;
                const MAX_PVS = 5; /*Max Charts too*/

                let _pvs = pvs || [];

                let addPv = function (pv) {
                    if (_pvs.indexOf(pv) !== -1) {
                        alert('Already charting pv: ' + pv);
                        return;
                    }

                    if (_pvs.length + 1 > MAX_PVS) {
                        alert('Too many pvs; maximum number is: ' + MAX_PVS);
                        return;
                    }

                    _pvs.push(pv);

                    _pvs.sort();
                };

                this.addPvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        addPv(pvs[i]);
                    }

                    _viewer.addPvs(pvs);
                };

                this.removePvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        let j = _pvs.indexOf(pvs[i]);
                        _pvs.splice(j, 1);
                    }

                    _viewer.removePvs(pvs);
                };

                this.getPvs = function () {
                    return _pvs.slice(0); /*Return a copy since array is mutable*/
                };

                let _layoutManager;

                let updateLayoutManager = function () {
                    console.log(_options.layoutMode);
                    if (_options.layoutMode === wave.layoutModeEnum.SEPARATE_CHART) {
                        console.log('multiple');
                        _layoutManager = new wave.SeparateChartLayoutManager(self);
                    } else {
                        console.log('single');
                        _layoutManager = new wave.SingleChartLayoutManager(self);
                    }
                }();

                /*updateLayoutManager();*/
                console.log(_layoutManager);

                let _viewer;

                let updateViewer = function () {
                    if (_viewer) {
                        _viewer.destroy();
                    }

                    if (_options.viewerMode === wave.viewerModeEnum.STRIP) {
                        _viewer = new wave.StripViewer(_options, _layoutManger);
                    } else {
                        _viewer = new wave.ArchiveViewer(_options, _layoutManager);
                    }
                }(); /*call function immediately*/

                if (_options.viewerMode === wave.viewerModeEnum.ARCHIVE) {
                    _viewer.addPvs(_pvs);
                } /*if STRIP the onopen callback will handle this*/

                /*Don't register resize event until after page load*/
                $(window).on("resize", function () {
                    console.log("window resize");
                    _viewer.doLayout();
                });
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
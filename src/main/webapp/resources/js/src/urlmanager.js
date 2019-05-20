/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.UrlManager = class UrlManager {
            constructor() {
                let _options = new wave.ApplicationOptions();

                this.getOptions = function () {
                    return _options;
                };

                /*Start parsing*/
                let uri = new URI(),
                        queryMap = uri.query(true);
                if (uri.hasQuery("start")) {
                    _options.start = wave.util.parseIsoDateTimeString(queryMap["start"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {start: wave.util.toIsoDateTimeString(_options.start)});
                    window.history.replaceState({}, 'Set start: ' + _options.start, url);
                }

                if (uri.hasQuery("end")) {
                    _options.end = wave.util.parseIsoDateTimeString(queryMap["end"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {end: wave.util.toIsoDateTimeString(_options.end)});
                    window.history.replaceState({}, 'Set end: ' + _options.end, url);
                }

                if (uri.hasQuery("layoutMode")) {
                    _options.layoutMode = parseInt(queryMap["layoutMode"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {layoutMode: _options.layoutMode});
                    window.history.replaceState({}, 'Set multiple PV Mode: ' + _options.layoutMode, url);
                }

                if (uri.hasQuery("viewerMode")) {
                    _options.viewerMode = parseInt(queryMap["viewerMode"]);
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {viewerMode: _options.viewerMode});
                    window.history.replaceState({}, 'Set viewer Mode: ' + _options.viewerMode, url);
                }

                let _pvs = queryMap["pv"] || [];
                if (!Array.isArray(_pvs)) {
                    _pvs = [_pvs];
                }

                this.getPvs = function () {
                    return _pvs;
                };

                let addPv = function (pv) {
                    let uri = new URI(),
                            queryMap = uri.query(true),
                            pvs = queryMap['pv'] || [],
                            addToUrl = false;
                    if (!Array.isArray(pvs)) {
                        pvs = [pvs];
                    }

                    if ($.inArray(pv, pvs) === -1) {
                        addToUrl = true;
                    }

                    if (addToUrl) {
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {pv: pv});
                        window.history.replaceState({}, 'Add pv: ' + pv, url);
                    }
                };

                let removePv = function (pv) {
                    let uri = new URI();
                    uri.removeQuery("pv", pv);
                    
                    let url = uri.href();
                    window.history.replaceState({}, 'Remove pv: ' + pv, url);                    
                };

                this.addPvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        addPv(pvs[i]);
                    }
                };

                this.removePvs = function (pvs) {
                    for (let i = 0; i < pvs.length; i++) {
                        removePv(pvs[i]);
                    }
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
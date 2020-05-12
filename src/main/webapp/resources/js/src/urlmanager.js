/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.UrlManager = class UrlManager {
            constructor() {
                let _options = new wave.ApplicationOptions();
                let _preferences = {};

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

                if (uri.hasQuery("myaDeployment")) {
                    _options.myaDeployment = queryMap["myaDeployment"];
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {myaDeployment: _options.myaDeployment});
                    window.history.replaceState({}, 'Set myaDeployment', url);
                }

                if (uri.hasQuery("myaLimit")) {
                    _options.myaLimit = queryMap["myaLimit"];
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {myaLimit: _options.myaLimit});
                    window.history.replaceState({}, 'Set myaLimit', url);
                }

                if (uri.hasQuery("windowMinutes")) {
                    _options.liveWindowMinutes = queryMap["windowMinutes"];
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {windowMinutes: _options.liveWindowMinutes});
                    window.history.replaceState({}, 'Set windowMinutes', url);
                }

                if (uri.hasQuery("title")) {
                    _options.title = queryMap["title"];
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {title: _options.title});
                    window.history.replaceState({}, 'Set title', url);
                }

                if (uri.hasQuery("fullscreen")) {
                    _options.fullscreen = queryMap["fullscreen"];
                } else {
                    let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), {fullscreen: _options.fullscreen});
                    window.history.replaceState({}, 'Set fullscreen', url);
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

                /* PVs*/
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

                    uri.removeQuery(pv + "label");
                    uri.removeQuery(pv + "color");

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


                /* PV Preferences */
                for(let i = 0; i < _pvs.length; i++) {
                    let pv = _pvs[i];

                    let label = pv;
                    let color = wave.colors.shift();
                    let yAxisLabel = null;
                    let yAxisMin = null;
                    let yAxisMax = null;
                    let yAxisLog = null;
                    let scaler = null;

                    let key = pv + 'label';
                    if (uri.hasQuery(key)) {
                        label = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = label;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV Label', url);
                    }

                    key = pv + 'color';
                    if (uri.hasQuery(key)) {
                        color = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = color;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV Color', url);
                    }

                    key = pv + 'yAxisLabel';
                    if (uri.hasQuery(key)) {
                        yAxisLabel = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = yAxisLabel;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV yAxisLabel', url);
                    }

                    key = pv + 'yAxisMin';
                    if (uri.hasQuery(key)) {
                        yAxisMin = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = yAxisMin;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV yAxisMin', url);
                    }

                    key = pv + 'yAxisMax';
                    if (uri.hasQuery(key)) {
                        yAxisMax = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = yAxisMax;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV yAxisMax', url);
                    }

                    key = pv + 'yAxisLog';
                    if (uri.hasQuery(key)) {
                        yAxisLog = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = yAxisLog;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV yAxisLog', url);
                    }

                    key = pv + 'scaler';
                    if (uri.hasQuery(key)) {
                        scaler = queryMap[key];
                    } else {
                        let obj = {};
                        obj[key] = scaler;
                        let url = $.mobile.path.addSearchParams($.mobile.path.getLocation(), obj);
                        window.history.replaceState({}, 'Set PV scaler', url);
                    }

                    _preferences[pv] = {};
                    _preferences[pv].label = label;
                    _preferences[pv].color = color;
                    _preferences[pv].yAxisLabel = yAxisLabel;
                    _preferences[pv].yAxisMin = yAxisMin;
                    _preferences[pv].yAxisMax = yAxisMax;
                    _preferences[pv].yAxisLog = yAxisLog;
                    _preferences[pv].scaler = scaler;
                }

                this.getPreferences = function() {
                    return _preferences;
                };
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));

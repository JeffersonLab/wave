/* JQUERY / JQUERY MOBILE 'READY' EVENT */
$(document).on("pagecontainerchange", function () {
    /* We wrap in jQuery ready function since we want BOTH jquery mobile to be fully transitioned AND the DOM fully loaded*/
    $(function () {
        let _urlManager = new jlab.wave.UrlManager(); /*Manage URL Parameters*/
        let _chartManager = new jlab.wave.ChartManager(_urlManager.getOptions(), _urlManager.getPvs()); /*Manage Chart Viewer*/
        new jlab.wave.GuiManager(_chartManager, _urlManager); /*Manage GUI - user input and menus */
    });
});
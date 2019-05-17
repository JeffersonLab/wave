/* JQUERY / JQUERY MOBILE 'READY' EVENT */
$(document).on("pagecontainerchange", function () {
    /* We wrap in jQuery ready function since we want BOTH jquery mobile to be fully transitioned AND the DOM fully loaded*/
    $(function () {
        new jlab.wave.AppManager();
    });
});
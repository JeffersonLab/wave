var jlab = jlab || {};
jlab.wave = jlab.wave || {};

jlab.wave.Series = function (pv) {
    this.pv = pv;
    this.data = null;
    this.chart = null;
    this.metadata = null;
    this.preferences = null; /*Unlike metadata, this is maintained across fetch refreshes*/
};
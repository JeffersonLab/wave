var jlab = jlab || {};
jlab.wave = jlab.wave || {};

/**
 * Constructor for Series object. 
 * 
 * A wave Series encapsulates all of the information associated with a PV.
 * 
 * @param {string} pv - The PV name
 * @returns {jlab.wave.Series} - The series
 */
jlab.wave.Series = function (pv) {
    this.pv = pv;
    this.data = null; /* Array of X,Y values */
    this.chart = null; /* Reference to jlab.wave.Chart */
    this.metadata = null; /* Object */
    this.preferences = null; /* Unlike metadata, this is maintained across fetch refreshes */
};
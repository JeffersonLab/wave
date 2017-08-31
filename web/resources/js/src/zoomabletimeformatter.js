/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        /**
         * A wave ZoomableTimeFormatter encapsulates all of the tasks associated with 
         * formatting time for a chart that can be zoomed and reset. In particular the 
         * following public attributes are provided:
         * 
         * title - chart title is a concisely formatted unzoomed date range
         * 
         * tickFormat - tick format is as concise as possible and avoids repeating 
         * fields implied by title, but takes into consideration zoom level
         * 
         * interval - CanvasJS specific: a sensible interval between ticks given the 
         * start and end date and zoom
         * 
         * intervalType - CanvasJS specific: a sensible scale for the interval "month", 
         * "week", "day", etc.
         * 
         * In addition there are non-changing "starting" values for tickFormat, 
         * interval, and intervalType such that a reset is possible (zoom out).
         * 
         * @param {date} start - The start date
         * @param {date} end - The end date
         * @returns {jlab.wave.TimeFormatter} - The time formatter
         */
        wave.ZoomableTimeFormatter = class ZoomableTimeFormatter {
            constructor(start, end) {
                let sameYear = false,
                        sameMonth = false,
                        sameDay = false,
                        oneDaySpecial = false,
                        oneMonthSpecial = false,
                        oneYearSpecial = false,
                        startTimeNonZero = false,
                        endTimeNonZero = false,
                        formattedTime = '',
                        formattedStartDate,
                        formattedEndDate;

                this.title = '';
                this.tickFormat = null;
                this.interval = null;
                this.intervalType = null;

                if (start.getHours() !== 0 || start.getMinutes() !== 0 || start.getSeconds() !== 0) {
                    startTimeNonZero = true;
                }

                if (end.getHours() !== 0 || end.getMinutes() !== 0 || end.getSeconds() !== 0) {
                    endTimeNonZero = true;
                }

                if (startTimeNonZero || endTimeNonZero) {
                    formattedTime = ' (' + jlab.wave.util.toUserTimeString(start) + ' - ' + jlab.wave.util.toUserTimeString(end) + ')';
                } else { /*Check for no-time special cases*/
                    let d = new Date(start.getTime());
                    d.setDate(start.getDate() + 1);
                    oneDaySpecial = d.getTime() === end.getTime();

                    if (!oneDaySpecial && start.getDate() === 1) { /*Check for one month special*/
                        d = new Date(start.getTime());
                        d.setMonth(start.getMonth() + 1);
                        oneMonthSpecial = d.getTime() === end.getTime();

                        if (!oneMonthSpecial && start.getMonth() === 0) { /*Check for one year special*/
                            d = new Date(start.getTime());
                            d.setFullYear(start.getFullYear() + 1);
                            oneYearSpecial = d.getTime() === end.getTime();
                        }
                    }
                }

                sameYear = start.getFullYear() === end.getFullYear();
                sameMonth = sameYear ? start.getMonth() === end.getMonth() : false;
                sameDay = sameMonth ? start.getDate() === end.getDate() : false;

                if (oneDaySpecial) {
                    this.title = jlab.wave.util.fullMonthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
                } else if (oneMonthSpecial) {
                    this.title = jlab.wave.util.fullMonthNames[start.getMonth()] + ' ' + start.getFullYear();
                } else if (oneYearSpecial) {
                    this.title = start.getFullYear();
                } else {
                    if (sameYear) {
                        formattedStartDate = jlab.wave.util.fullMonthNames[start.getMonth()] + ' ' + start.getDate();

                        if (sameMonth) {
                            if (sameDay) {
                                formattedEndDate = ', ' + end.getFullYear();
                            } else { /*Days differ*/
                                formattedEndDate = ' - ' + end.getDate() + ', ' + end.getFullYear();
                            }
                        } else { /*Months differ*/
                            formattedEndDate = ' - ' + jlab.wave.util.fullMonthNames[end.getMonth()] + ' ' + end.getDate() + ', ' + end.getFullYear();
                        }
                    } else { /*Years differ*/
                        formattedStartDate = jlab.wave.util.fullMonthNames[start.getMonth()] + ' ' + start.getDate() + ', ' + start.getFullYear();
                        formattedEndDate = ' - ' + jlab.wave.util.fullMonthNames[end.getMonth()] + ' ' + end.getDate() + ', ' + end.getFullYear();
                    }

                    this.title = formattedStartDate + formattedEndDate + formattedTime;
                }

                let impliedYear = sameYear || oneYearSpecial,
                        impliedYearMonth = sameMonth || oneMonthSpecial,
                        impliedYearMonthDay = sameDay || oneDaySpecial;

                /**
                 * Adjusts the tickFormat, interval, and intervalType given zoom parameters.
                 * 
                 * @param {number} minMillis - starting miliseconds from Epoch
                 * @param {number} maxMillis - ending milliseconds from Epoch
                 */
                wave.ZoomableTimeFormatter.prototype.adjustForViewportZoom = function (minMillis, maxMillis) {
                    let formatter = {year: false, month: false, day: false, hour: false, minute: false, second: false};

                    this.intervalType = null;
                    this.interval = null;

                    if (!impliedYear) {
                        formatter.year = true;

                        if (!impliedYearMonth) {
                            formatter.month = true;

                            if (!impliedYearMonthDay) {
                                formatter.day = true;
                            }
                        }
                    }

                    let millisPerMinute = 1000 * 60, /*Ignore leap seconds as timestamps from Epoch do*/
                            millisPerHour = millisPerMinute * 60,
                            millisPerDay = millisPerHour * 24, /*UTC - no timezone - no daylight savings*/
                            millisPerMonth = millisPerDay * 30, /*Approximate*/
                            millisPerYear = millisPerMonth * 12,
                            rangeMillis = (maxMillis - minMillis);

                    // Less than a few minutes
                    if ((rangeMillis / millisPerMinute) < 6) {
                        formatter.hour = true;
                        formatter.minute = true;
                        formatter.second = true;
                    }
                    // Less than a few hours
                    else if ((rangeMillis / millisPerHour) < 12) {
                        formatter.hour = true;
                        formatter.minute = true;
                    }
                    // Less than a few days
                    else if (rangeMillis / (millisPerDay) < 7) {
                        formatter.hour = true;
                        /*this.interval = Math.max(Math.round((rangeMillis / millisPerHour) / 12), 1);
                         this.intervalType = 'hour';*/
                    }
                    // Less than a few months
                    else if ((rangeMillis / millisPerMonth) < 6) {
                        formatter.day = true;
                    }
                    // Less than a few years
                    else if ((rangeMillis / millisPerYear) < 3) {
                        formatter.month = true;
                        formatter.day = false;
                        this.interval = Math.max(Math.round((rangeMillis / millisPerMonth) / 12), 1);
                        this.intervalType = 'month';
                    }
                    // Many years
                    else {
                        formatter.year = true;
                        formatter.month = true;
                        formatter.day = false;
                    }

                    this.tickFormat = '';

                    if (formatter.month) {
                        this.tickFormat = this.tickFormat + "MMM";
                    }

                    if (formatter.day) {
                        this.tickFormat = this.tickFormat + " DD";
                    }

                    if (formatter.year) {
                        this.tickFormat = this.tickFormat + " YYYY";
                    }

                    if (formatter.hour || formatter.minute) {
                        this.tickFormat = this.tickFormat + " HH:mm";
                    }

                    if (formatter.second) {
                        this.tickFormat = this.tickFormat + ":ss";
                    }

                    this.tickFormat = this.tickFormat.trim();
                };

                /*Initialize with unzoomed values*/
                this.adjustForViewportZoom(start.getTime(), end.getTime());

                this.startingTickFormat = this.tickFormat;
                this.startingInterval = this.interval;
                this.startingIntervalType = this.intervalType;
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));

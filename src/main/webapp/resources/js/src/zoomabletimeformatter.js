/*Organized as a 'Revealing Module' with namespace jlab.wave*/
(function (jlab) {
    (function (wave) {
        wave.ZoomableTimeFormatter = class ZoomableTimeFormatter {
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
             * @param {luxon.DateTime} start - The start date
             * @param {luxon.DateTime} end - The end date
             * @returns {jlab.wave.TimeFormatter} - The time formatter
             */
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

                if (start.hour !== 0 || start.minute !== 0 || start.second !== 0) {
                    startTimeNonZero = true;
                }

                if (end.hour !== 0 || end.minute !== 0 || end.second !== 0) {
                    endTimeNonZero = true;
                }

                if (startTimeNonZero || endTimeNonZero) {
                    formattedTime = ' (' + jlab.wave.util.toUserTimeString(start) + ' - ' + jlab.wave.util.toUserTimeString(end) + ')';
                } else { /*Check for no-time special cases*/
                    let d = luxon.DateTime.fromMillis((start.toMillis()));
                    d = d.plus({day: 1})
                    oneDaySpecial = d.toMillis() === end.toMillis();

                    if (!oneDaySpecial && start.day === 1) { /*Check for one month special*/
                        d = luxon.DaetTime.fromMillis(start.toMillis());
                        d = d.plus({month: 1});
                        oneMonthSpecial = d.toMillis() === end.toMillis();

                        if (!oneMonthSpecial && start.month=== 0) { /*Check for one year special*/
                            d = luxon.DateTime.fromMillis(start.toMillis());
                            d = d.plus({year: 1});
                            oneYearSpecial = d.toMillis() === end.toMillis();
                        }
                    }
                }

                sameYear = start.year === end.year;
                sameMonth = sameYear ? start.month === end.month : false;
                sameDay = sameMonth ? start.day === end.day : false;

                if (oneDaySpecial) {
                    this.title = jlab.wave.util.fullMonthNames[start.month + 1] + ' ' + start.day + ', ' + start.year;
                } else if (oneMonthSpecial) {
                    this.title = jlab.wave.util.fullMonthNames[start.month + 1] + ' ' + start.year;
                } else if (oneYearSpecial) {
                    this.title = start.year;
                } else {
                    if (sameYear) {
                        formattedStartDate = jlab.wave.util.fullMonthNames[start.month + 1] + ' ' + start.day;

                        if (sameMonth) {
                            if (sameDay) {
                                formattedEndDate = ', ' + end.year;
                            } else { /*Days differ*/
                                formattedEndDate = ' - ' + end.day + ', ' + end.year;
                            }
                        } else { /*Months differ*/
                            formattedEndDate = ' - ' + jlab.wave.util.fullMonthNames[end.month + 1] + ' ' + end.day + ', ' + end.year;
                        }
                    } else { /*Years differ*/
                        formattedStartDate = jlab.wave.util.fullMonthNames[start.month + 1] + ' ' + start.day + ', ' + start.year;
                        formattedEndDate = ' - ' + jlab.wave.util.fullMonthNames[end.month + 1] + ' ' + end.day + ', ' + end.year;
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
                this.adjustForViewportZoom(start.toMillis(), end.toMillis());

                this.startingTickFormat = this.tickFormat;
                this.startingInterval = this.interval;
                this.startingIntervalType = this.intervalType;
            }
        };
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));

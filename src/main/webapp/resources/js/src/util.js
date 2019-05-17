/*Organized as a 'Revealing Module' with namespace jlab.wave.util*/
(function (jlab) {
    (function (wave) {
        (function (util) {
            util.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            util.fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            util.hasTouch = function () {
                try {
                    document.createEvent("TouchEvent");
                    return true;
                } catch (e) {
                    return false;
                }
            };
            util.pad = function (n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            };
            util.intToStringWithCommas = function (x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };
            util.toIsoDateTimeString = function (x) {
                let year = x.getFullYear(),
                        month = x.getMonth() + 1,
                        day = x.getDate(),
                        hour = x.getHours(),
                        minute = x.getMinutes(),
                        second = x.getSeconds();
                return year + '-' + util.pad(month, 2) + '-' + util.pad(day, 2) + ' ' + util.pad(hour, 2) + ':' + util.pad(minute, 2) + ':' + util.pad(second, 2);
            };
            util.parseIsoDateTimeString = function (x) {
                let year = parseInt(x.substring(0, 4)),
                        month = parseInt(x.substring(5, 7)) - 1,
                        day = parseInt(x.substring(8, 10)),
                        hour = parseInt(x.substring(11, 13)),
                        minute = parseInt(x.substring(14, 16)),
                        second = parseInt(x.substring(17, 19));
                return new Date(year, month, day, hour, minute, second);
            };
            util.toUserDateString = function (x) {
                let year = x.getFullYear(),
                        month = x.getMonth(),
                        day = x.getDate();
                return util.triCharMonthNames[month] + ' ' + util.pad(day, 2) + ' ' + year;
            };
            util.toUserTimeString = function (x) {
                let hour = x.getHours(),
                        minute = x.getMinutes(),
                        second = x.getSeconds();
                return util.pad(hour, 2) + ':' + util.pad(minute, 2) + ':' + util.pad(second, 2);
            };
            util.toUserDateTimeString = function (x) {
                let year = x.getFullYear(),
                        month = x.getMonth(),
                        day = x.getDate(),
                        hour = x.getHours(),
                        minute = x.getMinutes(),
                        second = x.getSeconds();
                return util.triCharMonthNames[month] + ' ' + util.pad(day, 2) + ' ' + year + ' ' + util.pad(hour, 2) + ':' + util.pad(minute, 2) + ':' + util.pad(second, 2);
            };
            util.parseUserDate = function (x) {
                let month = jlab.wave.util.triCharMonthNames.indexOf(x.substring(0, 3)),
                        day = parseInt(x.substring(4, 6)),
                        year = parseInt(x.substring(7, 11));
                return new Date(year, month, day, 0, 0);
            };
            util.parseUserTime = function (x) {

                let hour, minute, second;

                if (x.trim() === '') {
                    hour = 0;
                    minute = 0;
                    second = 0;
                } else {
                    hour = parseInt(x.substring(0, 2));
                    minute = parseInt(x.substring(3, 5));
                    second = parseInt(x.substring(6, 9));
                }

                return new Date(2000, 0, 1, hour, minute, second);
            };
        })(wave.util || (wave.util = {}));
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
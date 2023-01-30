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
                return x.toISO({suppressMilliseconds: true, includeOffset: false});
            };
            util.parseIsoDateTimeString = function (x) {
                x = x.replace(' ', 'T');
                return luxon.DateTime.fromISO(x, {zone: 'America/New_York'});
            };
            util.toUserDateString = function (x) {
                let year = x.year,
                        month = x.month,
                        day = x.day;
                return util.triCharMonthNames[month + 1] + ' ' + util.pad(day, 2) + ' ' + year;
            };
            util.toUserTimeString = function (x) {
                let hour = x.hour,
                        minute = x.minute,
                        second = x.second;
                return util.pad(hour, 2) + ':' + util.pad(minute, 2) + ':' + util.pad(second, 2);
            };
            util.toUserDateTimeString = function (x) {
                let year = x.year,
                        month = x.month,
                        day = x.day,
                        hour = x.hour,
                        minute = x.minute,
                        second = x.second;
                return util.triCharMonthNames[month + 1] + ' ' + util.pad(day, 2) + ' ' + year + ' ' + util.pad(hour, 2) + ':' + util.pad(minute, 2) + ':' + util.pad(second, 2);
            };
            util.parseUserDate = function (x) {
                return luxon.DateTime.fromFormat(x, 'LLL dd yyyy', {zone: 'America/New_York'});
            };
            util.parseUserTime = function (x) {
                if (x.trim() === '') {
                    x = '00:00:00';
                }

                return luxon.DateTime.fromFormat(x, 'HH:mm:ss', {zone: 'America/New_York'});
            };
        })(wave.util || (wave.util = {}));
    })(jlab.wave || (jlab.wave = {}));
})(jlab || (jlab = {}));
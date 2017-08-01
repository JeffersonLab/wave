jlab = jlab || {};
jlab.wave = jlab.wave || {};
jlab.wave.util = jlab.wave.util || {};

jlab.wave.util.triCharMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
jlab.wave.util.fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

jlab.wave.util.hasTouch = function () {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
};
jlab.wave.util.pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
jlab.wave.util.intToStringWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
jlab.wave.util.toIsoDateTimeString = function (x) {
    let year = x.getFullYear(),
            month = x.getMonth() + 1,
            day = x.getDate(),
            hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return year + '-' + jlab.wave.util.pad(month, 2) + '-' + jlab.wave.util.pad(day, 2) + ' ' + jlab.wave.util.pad(hour, 2) + ':' + jlab.wave.util.pad(minute, 2) + ':' + jlab.wave.util.pad(second, 2);
};
jlab.wave.util.parseIsoDateTimeString = function (x) {
    let year = parseInt(x.substring(0, 4)),
            month = parseInt(x.substring(5, 7)) - 1,
            day = parseInt(x.substring(8, 10)),
            hour = parseInt(x.substring(11, 13)),
            minute = parseInt(x.substring(14, 16)),
            second = parseInt(x.substring(17, 19));
    return new Date(year, month, day, hour, minute, second);
};
jlab.wave.util.toUserDateString = function (x) {
    let year = x.getFullYear(),
            month = x.getMonth(),
            day = x.getDate();
    return jlab.wave.util.triCharMonthNames[month] + ' ' + jlab.wave.util.pad(day, 2) + ' ' + year;
};
jlab.wave.util.toUserTimeString = function (x) {
    let hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return jlab.wave.util.pad(hour, 2) + ':' + jlab.wave.util.pad(minute, 2) + ':' + jlab.wave.util.pad(second, 2);
};
jlab.wave.util.toUserDateTimeString = function (x) {
    let year = x.getFullYear(),
            month = x.getMonth(),
            day = x.getDate(),
            hour = x.getHours(),
            minute = x.getMinutes(),
            second = x.getSeconds();
    return jlab.wave.util.triCharMonthNames[month] + ' ' + jlab.wave.util.pad(day, 2) + ' ' + year + ' ' + jlab.wave.util.pad(hour, 2) + ':' + jlab.wave.util.pad(minute, 2) + ':' + jlab.wave.util.pad(second, 2);
};
jlab.wave.util.parseUserDate = function (x) {
    let month = jlab.wave.util.triCharMonthNames.indexOf(x.substring(0, 3)),
            day = parseInt(x.substring(4, 6)),
            year = parseInt(x.substring(7, 11));
    return new Date(year, month, day, 0, 0);
};
jlab.wave.util.parseUserTime = function (x) {

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
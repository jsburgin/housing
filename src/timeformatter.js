exports.getPrettyTimeString = function(timeString) {
    if (timeString == "") {
        return timeString;
    }

    var split = timeString.split(':');
    var newTimeString = '';
    split[0] = parseInt(split[0]);
    if (split[0] > 11) {
        if (parseInt(split[0]) != 12) {
            split[0] = split[0] - 12;
        }
        newTimeString += split[0] + ':' + split[1] + ' P.M.';
    } else {
        newTimeString += split[0] + ':' + split[1] + ' A.M.';
    }

    return newTimeString;
}

exports.getTimeString = function(timeString) {
    var format = timeString.slice(-2);
    var hours = timeString.substring(0, timeString.indexOf(':'));

    timeString = timeString.substr(0, timeString.length - 3);

    if (format == 'AM') {
        if (hours.length == 1) {
            timeString = '0' + timeString;
        } else if (hours == '12') {
            timeString = timeString.substr(2);
            timeString = '00' + timeString;
        }
    } else {
        if (hours != "12") {
            if (hours.length == 1) {
                timeString = timeString.substring(1);
            } else {
                timeString = timeString.substr(2);
            }
            hours = parseInt(hours) + 12;
            timeString = hours + timeString;
        }
    }

    return timeString;
}

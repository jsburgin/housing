module.exports = function(timeString) {
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
var async = require('async');

exports.calendarSocketManager = function(socket, next) {
	
	socket.on('getDay', function(dateString) {
		console.log('to get a day!');
	});

	socket.on('disconnect', function() {
		next(null);
	});
}
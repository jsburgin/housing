var async = require('async');
var dateFormat = require('dateformat');

var Notification = require('../models/notification');

exports.notificationDiagnostics = function(socket, next) {
	getNotificationGraphData(30, function(err, data) {
		if (err) {
			return next(err);
		}

		socket.emit('notificationGraphData', data);
	});

	socket.on('disconnect', function() {
		return next(null);	
	});
};

function getNotificationGraphData (days, next) {
	async.waterfall([
		function(cb) {
			var greaterThanDate = new Date();
			greaterThanDate.setDate(greaterThanDate.getDate() - days);
			
			Notification.getAll({ 'time': { $gt : greaterThanDate } }, cb);
		},
		function(notifications, cb) {
			countsByDay(notifications, cb);
		}
	], function(err, data) {
		if (err) {
			return next(err);
		}
		next(null, data);
	});

	function countsByDay(notifications, next) {

		var timeCompare = [];
		var days = ['x'];
		var counts = ['Notifications'];

		for (var i = 0; i < notifications.length; i++) {

			// get the time of the current notification
			var notificationTime = new Date(notifications[i].time);


			notificationTime.setHours(0);
			notificationTime.setMinutes(0);
			notificationTime.setSeconds(0);
			notificationTime.setMilliseconds(0);
			

			if (timeCompare.length == 0) {
				timeCompare.push(notificationTime);
				days.push(dateFormat(notificationTime, "yyyy-mm-dd"));
				counts.push(1);
				continue;
			}

			if (timeCompare[timeCompare.length - 1].getTime() == notificationTime.getTime()) {
				counts[counts.length - 1]++;
			} else {
				timeCompare.push(notificationTime);
				days.push(dateFormat(notificationTime, "yyyy-mm-dd"));
				counts.push(1);	
			}
		}

		next(null, {
			x: days,
			y: counts
		});
	}
};

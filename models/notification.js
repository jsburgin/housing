var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var postOffice = require('../postoffice');

exports.getAll = function(options, next) {
	mongo.retrieveSorted({}, 'notifications', { name: 'time', order: -1 }, function(err, notifications) {
		if (err) {
			return next(err);
		}

		next(null, notifications);
	});
};

exports.add = function(notificationData, next) {

	if (!notificationData.subject || !notificationData.message) {
		return next('Must include subject and message for notification model.');
	}

	if (notificationData.toemail == 'on') {

		// would generate user list here
		var sendData = [{ to: 'jsburgin@crimson.ua.edu' }];

		for (var i = 0; i < sendData.length; i++) {
			sendData[i].subject = notificationData.subject;
			sendData[i].html = notificationData.message;
		}

		async.map(sendData, postOffice.sendMail, function(err) {
			if (err) {
				console.errror(err);
			}
		});

	}

	delete notificationData.toemail;

	// date possibly pre-defined in setup -> addNotification
	if (notificationData.sentTime) {
		notificationData.time = notificationData.sentTime;
	} else {
		notificationData.time = new Date();	
	}

	notificationData.prettyTime = dateFormat(notificationData.time, "mm/dd/yyyy h:MM TT");

	
	mongo.insert(notificationData, 'notifications', function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});

};

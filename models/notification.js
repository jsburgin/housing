var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var postOffice = require('../postoffice');
var User = require('./user');

exports.getAll = function(options, next) {
	mongo.retrieveSorted({}, 'notifications', { time: -1 }, function(err, notifications) {
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

	if (notificationData.toEmail) {

		async.waterfall([
			function(cb) {
				User.getAllByPositionAndBuilding(notificationData.positions, notificationData.buildings, cb);
			},
			function(users, cb) {
				var sendData = [];

				for (var i = 0; i < users.length; i++) {
					sendData.push({
						to: users[i].email,
						subject: notificationData.subject,
						html: notificationData.message
					});
				}

				cb(null, sendData);

			},
			function(sendData, cb) {
				async.map(sendData, postOffice.sendMail, cb);
			}
		], function(err) {
			if (err) {
				console.error(err);
			}
		});

	}

	// date possibly pre-defined in setup -> addNotification
	if (notificationData.sentTime) {
		notificationData.time = notificationData.sentTime;
	} else {
		notificationData.time = new Date();	
	}

	notificationData.prettyTime = dateFormat(notificationData.time, "mm/dd/yyyy h:MM TT");

	var insertObject = {
		data: notificationData,
		collection: 'notifications'
	};
	
	mongo.insert(insertObject, function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});

};

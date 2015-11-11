var mongo = require('../mongo');

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

	notificationData.time = Date.now();

	mongo.insert(notificationData, 'notifications', function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});

};
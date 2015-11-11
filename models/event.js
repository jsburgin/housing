var mongo = require('../mongo');

exports.add = function(eventObject, next) {
	mongo.insert(eventObject, 'events', function(err, result) {
		if (err) {
			return next(err);
		}

		next(null);
	});
};

exports.getAll = function(next) {
	mongo.retrieve({}, 'events', function(err, events) {
		next(err, events);
	});
};
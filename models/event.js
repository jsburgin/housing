var async = require('async');

var mongo = require('../mongo');
var User = require('./user');

exports.add = function(eventObject, next) {
	async.waterfall([
		function(cb) {
			if (eventObject.title && eventObject.description) {
				return cb(null);
			}

			cb('Required fields for event are missing.');
		},
		function(cb) {
			mongo.insert(eventObject, 'events', cb);
		},
		function(results, cb) {
			cb(null);
		}
	], function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});
};

exports.getForUser = function(userId, next) {
	async.waterfall([
		function(cb) {
			User.get({id: userId}, cb);	
		},
		function(user, cb) {
			var query = {
				positions: { $in: [user.positionid] },
				buildings: { $in: [user.buildingid] }
			}
			mongo.retrieve(query, 'events', cb);
		}
	], function(err, results) {
		if (err) {
			return next(err);
		}

		next(null, results);
	});
};

exports.getAll = function(next) {
	mongo.retrieve({}, 'events', function(err, events) {
		next(err, events);
	});
};
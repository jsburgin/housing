var async = require('async');

var mongo = require('../mongo');
var User = require('./user');

exports.add = function(eventObject, next) {
	var events = [];

	for (var i = 0; i < eventObject.instances.length; i++) {
		var currentInstance = eventObject.instances[i];
		currentInstance.title = eventObject.title;
		currentInstance.description = eventObject.description;
		currentInstance.date = eventObject.date;
		events.push({ data: currentInstance, collection: 'events' });
	}

	async.map(events, mongo.insert, next);
};

exports.getForUser = function(userId, next) {
	async.waterfall([
		function(cb) {
			User.get({id: userId}, cb);	
		},
		function(user, cb) {

			if(!user) {
				return cb('No user with that ID exists.');
			}
			
			var query = {
				$and: [
					{ positions: { $in: [user.positionid] } },
					{
						$or: [
							{ buildings: { $in: [user.buildingid] } },
							{ groups: { $in: user.groups } }
						]	
					},
					{
						$or: [
							{ experience: user.experience },
							{ experience: 2 }
						]
					}
				]
			};
			mongo.eventRetrieve(query, 'events', cb);
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
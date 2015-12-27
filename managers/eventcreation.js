var async = require('async');

var Group = require('../models/group');
var Building = require('../models/building');
var Position = require('../models/position');
var Event = require('../models/event');

exports.listen = function(socket, next) {
	async.parallel([
		function(cb) {
			Position.getAll(cb);
		},
		function(cb) {
			Building.getAll(cb);
		},
		function(cb) {
			Group.getAll(cb);
		}
	], function(err, results) {
		if (err) {
			return next(err);
		}

		var eventPackage = {
			positions: results[0],
			buildings: results[1],
			groups: results[2]
		};

		socket.emit('eventPackage', eventPackage);
	});

	socket.on('newEvent', function(newEvent) {

		Event.add(newEvent, function(err) {
			if (err) {
				console.log(err);
			}

			socket.emit('eventCreated', true);
		});

	});

	socket.on('disconnect', function() {
		return next(null);
	});
}
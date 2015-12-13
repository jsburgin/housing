var db = require('../db');

exports.getAll = function(next) {
	db.select().from('group')
		.orderBy('name')
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			next(null, results);
		});
};

exports.add = function(groupData, next) {
	db('group').insert(buildingData)
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			next(null);
		});
};

exports.get = function(groupData, next) {
	db('group').select()
		.where(groupData)
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			if (results.length > 0) {
				return next(null, results[0]);
			}

			next(null, null);
		});
};
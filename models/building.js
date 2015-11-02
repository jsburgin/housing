var db = require('../db');

exports.getAll = function(next) {
	db.select().from('building')
	.asCallback(function(err, buildings) {
		if (err) {
			return next(err);
		}

		next(null, buildings);
	});
}
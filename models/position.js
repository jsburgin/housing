var db = require('../db');

exports.getAll = function(next) {
	db.select().from('position')
	.orderBy('name')
	.asCallback(function(err, positions) {
		if (err) {
			return next(err);
		}

		next(null, positions);
	});
}
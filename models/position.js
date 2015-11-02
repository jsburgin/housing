var db = require('../db');

exports.getAll = function(next) {
	db.select().from('position')
	.asCallback(function(err, positions) {
		if (err) {
			return next(err);
		}

		next(null, positions);
	});
}
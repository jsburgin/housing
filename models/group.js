var db = require('../db');

exports.getAll = function(next) {
	db.select().from('staffgroup')
		.orderBy('name')
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			results.unshift({
				name: 'None',
				id: -1
			});

			next(null, results);
		});
};

exports.add = function(groupData, next) {
	db('staffgroup').insert(groupData)
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			next(null);
		});
};

exports.get = function(groupData, next) {
	db('staffgroup').select()
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

exports.addUser = function(groupData, next) {
	db('staffgroupperson').insert(groupData)
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			return next(null);
		});
};

exports.updateUser = function (groupData, next) {
	if (groupData.groupid == -1) {
		db('staffgroupperson')
			.where('personid', '=', groupData.personid)
			.del().asCallback(function(err) {
				if (err) {
					return next(err);
				}

				next(null);
			});
	} else {
		db('staffgroupperson')
			.where('personid', '=', groupData.personid)
			.update({ groupid: groupData.groupid })
			.asCallback(function(err) {
				if (err) {
					return next(err);
				}

				next(null);
			});
	}
}
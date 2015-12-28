var db = require('../db');
var async = require('async');
require('dotenv').load();

var Group = require('./group');
var postOffice = require('../postoffice');

function get(userData, next) {

	if (userData['id']) {
		userData['person.id'] = userData['id'];
		delete userData['id'];
	}

	db.select('person.*', 'building.name as building', 'position.name as position', 'staffgroup.name as group', 'staffgroup.id as groupid').from('person')
		.join('position', 'person.positionid', '=', 'position.id')
		.join('building', 'person.buildingid', '=', 'building.id')
		.leftOuterJoin('staffgroupperson', 'person.id', '=', 'staffgroupperson.personid')
		.leftOuterJoin('staffgroup', 'staffgroupperson.groupid', '=', 'staffgroup.id')
		.where(userData)
		.asCallback(function(err, rows) {
			if (err) {
				return next(err);
			}

			if (rows.length > 0) {
				// most accurate match
				return next(null, rows[0])
			}

			next(null, null);
		});
};

exports.get = get;

exports.getAll = function(next) {
	db.select('person.*', 'building.name as building', 'position.name as position', 'staffgroup.name as group').from('person')
		.join('position', 'person.positionid', '=', 'position.id')
		.join('building', 'person.buildingid', '=', 'building.id')
		.leftOuterJoin('staffgroupperson', 'person.id', '=', 'staffgroupperson.personid')
		.leftOuterJoin('staffgroup', 'staffgroupperson.groupid', '=', 'staffgroup.id')
		.orderBy('lastname')
		.asCallback(function(err, rows) {
			if (err) {
				return next(err);
			}

			next(null, rows);
		});
};

function add(userData, next) {

	var userObj = {
		firstname: userData.firstName,
		lastname: userData.lastName,
		email: userData.email.toLowerCase(),
		positionid: userData.positionid,
		buildingid: userData.buildingid,
		room: userData.room,
		experience: userData.experience,
		accesscode: genAccessCode()
	};
	
	async.waterfall([
		function(cb) {
			// see if access code already exists
			get({ accesscode: userObj.accesscode }, cb);
		},
		function(user, cb) {
			if (!user) {
				// no matching access code found, continue
				cb(null);
			} else {
				// code already exists, restart add process to get new code
				// avoid stack overflow
				setTimeout(add, 0, userData, next);
			}
		},
		function(cb) {
			// add user to db
			db('person')
				.returning('id')
				.insert(userObj)
				.asCallback(function(err, results) {
					if (err) {
						return cb(err);
					}

					cb(null, results);
				});
		},
		function(results, cb) {
			// attach user to an necessary groups
			// -1 means 'None' was selected
			if (userData.group != -1) {
				Group.addUser({ personid: results[0], groupid: userData.group }, function(err) {
					if (err) {
						return cb(err);
					}
					cb(null);		
				});
			} else {
				cb(null);
			}
		},
		function(cb) {
			// send email to new user
			/*if (process.env.MAIL_ENABLED.toLowerCase() == 'true') {
				var email = {
					to: userObj.email,
					subject: 'Your UA Housing Access Code',
					html: 'To setup up the UA Housing Application, please use the code below:<br />' 
						+ userObj.accesscode
				};
				postOffice.sendMail(email, function(err) {
					if (err) {
						console.error(err);
					}
				});	
			}*/


			// immediately call callback to avoid long page load time on add user
			cb(null);
		}
	], function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});
};

exports.add = add;


exports.update = function(id, updates, next) {
	var group = updates.group;
	delete updates.group;

	async.parallel([
		function(cb) {
			db('person')
				.where({ id: id })
				.update(updates)
				.asCallback(function(err, results) {
					if (err) {
						return cb(err);
					}
					cb(null);
				});	
		},
		function(cb) {
			Group.updateUser({ personid: id, groupid: group }, cb);
		}
	], function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});

};

exports.remove = function(userData, next) {
	db('person')
		.where(userData)
		.del()
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			next(null);
		});
}

exports.getAllByPositionAndBuilding = function(positions, buildings, next) {
	db('person')
	.whereIn('positionid', positions)
	.whereIn('buildingid', buildings)
	.asCallback(function(err, results) {
		if (err) {
			return next(err);
		}

		next(null, results);
	});
};

function genAccessCode() {
	var accesscode = '';

	var choices = ["a", "b", "c", "d", "e", "f", "g",
        "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", 
        "7", "8", "9"];

    for (var i = 0; i < 6; i++) {
    	var index = Math.floor(Math.random() * choices.length);

    	accesscode += choices[index];
    }

    return accesscode;
}
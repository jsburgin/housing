var db = require('../db');
var async = require('async');
var bcrypt = require('bcrypt');

var postOffice = require('../postoffice');

// only use for getting non admins
exports.getAll = function(next) {
	db.select('person.*', 'building.name as building', 'position.name as position').from('person')
		.join('position', 'person.positionid', '=', 'position.id')
		.join('building', 'person.buildingid', '=', 'building.id')
		.where({isadmin: 0})
		.orderBy('lastname')
		.asCallback(function(err, rows) {
			if (err) {
				return next(err);
			}

			next(null, rows);
		});
};

// only use for getting non admins
exports.getOne = function(userData, next) {

	if (userData['id']) {
		userData['person.id'] = userData['id'];
		delete userData['id'];
	}

	db.select('person.*', 'building.name as building', 'position.name as position').from('person')
		.join('position', 'person.positionid', '=', 'position.id')
		.join('building', 'person.buildingid', '=', 'building.id')
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


// only use for getting admins
exports.getAdmin = function(userData, next) {
	userData.isadmin = 1;

	db.select().from('person')
	.where(userData)
	.asCallback(function(err, rows) {
		if (err) {
			return next(err);
		}

		if (rows.length > 0) {
			return next(null, rows[0]);
		}

		next(null, null);
	});
};

exports.emailUsed = function(email, next) {
	db.select().from('person')
	.where({ email: email })
	.asCallback(function(err, users) {
		if (err) {
			return next(err);
		}

		if (users.length > 0) {
			return next(null, true);
		}

		next(null, false);
	});
};

exports.addAdmin = function(userData, next) {

	var userObj = {
		firstname: userData.firstName,
		lastname: userData.lastName,
		email: userData.email.toLowerCase(),
		isadmin: 1
	};

	async.waterfall([
		function(cb) {
			// hash the password before storing it
			bcrypt.hash(userData.password, 10, cb);
		},
		function(hash, cb) {
			userObj.password = hash;
			cb(null);
		}
	], function(err) {
		if (err) {
			return next(err);
		}
		insertUser(userObj, next);
	});

};

function add(userData, next) {

	var userObj = {
		firstname: userData.firstName,
		lastname: userData.lastName,
		email: userData.email.toLowerCase(),
		isadmin: 0,
		positionid: userData.positionid,
		buildingid: userData.buildingid,
		accesscode: genAccessCode()
	};
	
	async.waterfall([
		function(cb) {
			// query db and check to see if access code already exists
			db.select('person.accesscode').from('person')
				.where({accesscode: userObj.accesscode})
				.asCallback(cb);
		},
		function(results, cb) {
			if (results.length == 0) {
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
			insertUser(userObj, cb);
		},
		function(cb) {
			// send email to new user
			var email = {
				to: userObj.email,
				subject: 'Your UA Housing Acecss Code',
				html: 'To setup up the UA Housing App, please use the code below:<br />' 
					+ userObj.accesscode
			};

			postOffice.sendMail(email, cb);
		}
	], function(err) {
		if (err) {
			return next(err);
		}

		next(null);
	});
};

exports.add = add;

function insertUser(userData, next) {
	db('person').insert(userData)
		.asCallback(function(err, results) {
			if (err) {
				return next(err);
			}

			next(null);
		});
}


function genAccessCode() {
	var accesscode = '';

	var choices = ["a", "b", "c", "d", "e", "f", "g",
        "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", 
        "7", "8", "9"];

    for (var i = 0; i < 4; i++) {
    	var index = Math.floor(Math.random() * 36);

    	accesscode += choices[index];
    }

    return accesscode;
}
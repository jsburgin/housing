var passport = require('passport');
var passportLocal = require('passport-local');
var bcrypt = require('bcrypt');
var async = require('async');

var User = require('../models/user');

module.exports = function() {
	passport.use(new passportLocal.Strategy({ usernameField: 'email' }, function(email, password, next) {
		// set when user is found
		var userToReturn;

		async.waterfall([
			function(cb) {
				User.getAdmin({ email: email }, cb);
			},
			function(user, cb) {

				if (!user) {
					// user does not exist
					return next(null, null);
				}

				userToReturn = user;
				bcrypt.compare(password, user.password, cb);
			},
			function(result, cb) {
				if (result) {
					// password matched, return user
					return next(null, userToReturn);
				}

				cb(null);
			}
		], function(err) {
			if (err) {
				return next(err);
			}

			// passwords did not match
			return next(null, null);
		});
	}));

	passport.serializeUser(function(user, next) {
		next(null, user.email);
	});

	passport.deserializeUser(function(email, next) {
		User.getAdmin({ email: email }, function(err, user) {
			if (err) {
				return next(err);
			}

			next(null, user);
		});
	});
};
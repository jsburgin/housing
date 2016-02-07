var async = require('async');
var bcrypt = require('bcrypt-nodejs');

var db = require('../db');

exports.add = function(userData, next) {

    var userObj = {
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email.toLowerCase()
    };

    async.waterfall([
        function(cb) {
            // hash the password before storing it
            bcrypt.hash(userData.password, null, null, cb);
        },
        function(hash, cb) {
            userObj.password = hash;
            cb(null);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }
        db('admin').insert(userObj)
            .asCallback(function(err, results) {
                if (err) {
                    return next(err);
                }

                next(null);
            });
    });

};

exports.get = function(userParams, next) {
    db('admin').select()
        .where(userParams)
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

exports.getAll = function(next) {
    db('admin').select()
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null, results);
        });
};

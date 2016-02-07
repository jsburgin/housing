var db = require('../db');
var async = require('async');

exports.getAll = function(next) {
    db.select().from('staffgroup')
        .orderBy('name')
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

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

function addUser(groupData, next) {
    db('staffgroupperson').insert(groupData)
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            return next(null);
        });
};

exports.addUser = addUser;

exports.updateUser = function (groupData, next) {
    async.waterfall([
        function(cb) {
            db('staffgroupperson')
            .where('personid', '=', groupData.deleteid)
            .del().asCallback(function(err) {
                if (err) {
                    return cb(err);
                }

                cb(null);
            });
        },
        function(cb) {
            async.map(groupData.groups, addUser, cb);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        next(null);
    });
}

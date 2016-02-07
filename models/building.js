var db = require('../db');

exports.getAll = function(next) {
    db.select().from('building')
        .orderBy('name')
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null, results);
        });
};

exports.add = function(buildingData, next) {
    db('building').insert(buildingData)
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
};

exports.get = function(buildingData, next) {
    db('building').select()
        .where(buildingData)
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

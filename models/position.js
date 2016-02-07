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

exports.add = function(buildingData, next) {
    db('position').insert(buildingData)
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
};

exports.get = function(buildingData, next) {
    db('position').select()
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

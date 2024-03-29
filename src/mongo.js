var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var config = require('config');

function getInstance(next) {
    MongoClient.connect(config.get('db.mongo'), function(err, db) {
        if (err) {
            return next(err);
        }

        next(null, db);
    });
}

exports.insert = function(insertObject, next) {

    var documentObject = insertObject.data;
    var collectionString = insertObject.collection;

    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.insertMany([documentObject], function(err, result) {
            db.close();
            return next(err, result);
        });
    });
};

exports.retrieve = function(documentParams, collectionString, next) {
    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.find(documentParams).toArray(function(err, results) {
            db.close();
            if (err) {
                return next(err);
            }

            next(null, results);
        });
    });
};

exports.retrieveSortedExclude = function(documentParams, exclude, sortBy, collectionString, next) {
    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.find(documentParams, exclude).sort(sortBy).toArray(function(err, results) {
            db.close();
            if (err) {
                return next(err);
            }

            next(null, results);
        });
    });
};

exports.retrieveSorted = function(documentParams, collectionString, sortBy, next) {
    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.find(documentParams).sort(sortBy).toArray(function(err, results) {
            db.close();
            if (err) {
                return next(err);
            }

            next(null, results);
        });
    });
};

exports.aggregate = function(stages, collectionString, next) {
    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.aggregate(stages).toArray(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null, results);
        });
    });
};

exports.remove = function(documentParams, collectionString, next) {
    getInstance(function(err, db) {
        if (err) {
            return next(err);
        }

        var collection = db.collection(collectionString);

        collection.deleteMany(documentParams, function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
    });
};

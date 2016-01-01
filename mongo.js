var MongoClient = require('mongodb').MongoClient;
var async = require('async');

require('dotenv').load();

function getInstance(next) {
	MongoClient.connect(process.env.MONGO_URL, function(err, db) {
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

exports.eventRetrieve = function(documentParams, collectionString, next) {
	getInstance(function(err, db) {
		if (err) {
			return next(err);
		}

		var collection = db.collection(collectionString);

		collection.find(documentParams, { buildings: 0, groups: 0, positions: 0, _id: 0, experience: 0 }).sort({ startTime: 1, date: 1 }).toArray(function(err, results) {
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

		var sortObj = {};
		sortObj[sortBy.name] = sortBy.order;

		collection.find(documentParams).sort(sortObj).toArray(function(err, results) {
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
"use strict"

var db = require('../db');

/**
 * Retrieves all buildings
 * @param  {Function} next callback
 */
function getAll(next) {
    db.select().from('building')
        .orderBy('name')
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null, results);
        });
};

/**
 * Creates a new building
 * @param {Object}   buildingData new building options
 * @param {Function} next         callback
 */
function add(buildingData, next) {
    db('building').insert(buildingData)
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
};

/**
 * Retrives a building
 * @param  {Object}   buildingData building options
 * @param  {Function} next         callback
 */
function get(buildingData, next) {
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

module.exports = {
    getAll: getAll,
    add: add,
    get: get
};

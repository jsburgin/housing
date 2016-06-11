"use strict"

var async = require('async');
var bcrypt = require('bcrypt-nodejs');

var db = require('../db');

/**
 * Creates a new administrator account, defaults to an unapproved account
 * @param {Object}   userData new admin options
 * @param {Function} next     callback
 */
function add(userData, next) {
    var userObj = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email.toLowerCase(),
        approved: 0
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

/**
 * Changes a newly create admin's status to approved, login access granted
 * @param  {Integer}   id
 * @param  {Function} next callback
 */
function approve(id, next) {
    db('admin')
        .where({ id: id })
        .update({ approved: 1 })
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
};

/**
 * Retrieves an administrator
 * @param  {Object}   userParams admin options
 * @param  {Function} next       callback
 */
function get(userParams, next) {
    db('admin').select('id', 'firstname', 'lastname', 'email', 'approved')
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

/**
 * Retrives all administrators
 * @param  {Function} next callback
 */
function getAll(next) {
    db('admin').select('id', 'firstname', 'lastname', 'email', 'approved')
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null, results);
        });
};

module.exports = {
    add: add,
    approve: approve,
    get: get,
    getAll: getAll
};



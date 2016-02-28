var db = require('../db');
var async = require('async');
require('dotenv').load();

var Group = require('./group');
var postOffice = require('../postoffice');

function get(userData, next) {

    if (userData['id']) {
        userData['person.id'] = userData['id'];
        delete userData['id'];
    }

    async.waterfall([
        function(cb) {
            db.select('person.*', 'building.name as building', 'position.name as position').from('person')
            .join('position', 'person.positionid', '=', 'position.id')
            .join('building', 'person.buildingid', '=', 'building.id')
            .where(userData)
            .asCallback(function(err, rows) {
                if (err) {
                    return cb(err);
                }

                if (rows.length > 0) {
                    // most accurate match
                    return cb(null, rows[0])
                }

                cb(null, null);
            });
        },
        function(user, cb) {
            if (user) {
                db.select().from('staffgroupperson')
                .where({ personid: user.id })
                .asCallback(function(err, rows) {
                    if (err) {
                        return cb(err);
                    }

                    cb(null, [user, rows]);
                });
            } else {
                cb(null, [null, null]);
            }
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        if (results[0]) {
            var user = results[0];
            user.groups = [];

            var groups = results[1];

            for (var i = 0; i < groups.length; i++) {
                user.groups.push(groups[i].groupid);
            }
        }


        next(null, user);
    });


};

exports.get = get;

exports.getAll = function(next) {
    db.select('person.*', 'building.name as building', 'position.name as position').from('person')
        .join('position', 'person.positionid', '=', 'position.id')
        .join('building', 'person.buildingid', '=', 'building.id')
        .orderBy('lastname')
        .asCallback(function(err, rows) {
            if (err) {
                return next(err);
            }

            next(null, rows);
        });
};

function add(userData, next) {

    if (!userData.groups) {
        userData.groups = [];
    }

    var userObj = {
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email.toLowerCase(),
        positionid: userData.positionid,
        buildingid: userData.buildingid,
        room: userData.room,
        experience: userData.experience,
        accesscode: genAccessCode()
    };

    async.waterfall([
        function(cb) {
            // see if access code already exists
            get({ accesscode: userObj.accesscode }, cb);
        },
        function(user, cb) {
            if (!user) {
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
            db('person')
                .returning('id')
                .insert(userObj)
                .asCallback(function(err, results) {
                    if (err) {
                        return cb(err);
                    }

                    cb(null, results);
                });
        },
        function(results, cb) {
            if (results.length == 0) {
                return cb('Unable to fetch user to add groups.');
            } else {
                var groupMaps = [];

                for (var i = 0; i < userData.groups.length; i++) {
                    groupMaps.push({
                        personid: results[0],
                        groupid: userData.groups[i]
                    });
                }

                async.map(groupMaps, Group.addUser, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }

            cb(null);
        },
        function(cb) {
            // send email to new user
            /*if (process.env.MAIL_ENABLED.toLowerCase() == 'true') {
                var email = {
                    to: userObj.email,
                    subject: 'Your UA Housing Access Code',
                    html: 'To setup up the UA Housing Application, please use the code below:<br />'
                        + userObj.accesscode
                };
                postOffice.sendMail(email, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }*/


            // immediately call callback to avoid long page load time on add user
            cb(null);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        next(null);
    });
};

exports.add = add;

exports.update = function(id, updates, next) {
    var group = updates.group;
    delete updates.group;

    async.parallel([
        function(cb) {
            db('person')
                .where({ id: id })
                .update(updates)
                .asCallback(function(err, results) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null);
                });
        },
        function(cb) {
            Group.updateUser({ personid: id, groupid: group }, cb);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        next(null);
    });

};

exports.remove = function(userData, next) {
    db('person')
        .where(userData)
        .del()
        .asCallback(function(err, results) {
            if (err) {
                return next(err);
            }

            next(null);
        });
}

exports.getAllByPositionAndBuilding = function(positions, buildings, next) {
    db('person')
    .whereIn('positionid', positions)
    .whereIn('buildingid', buildings)
    .asCallback(function(err, results) {
        if (err) {
            return next(err);
        }

        next(null, results);
    });
};

function genAccessCode() {
    var accesscode = '';

    var choices = ["a", "b", "c", "d", "e", "f", "g",
        "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
        "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6",
        "7", "8", "9"];

    for (var i = 0; i < 12; i++) {
        var index = Math.floor(Math.random() * choices.length);

        accesscode += choices[index];
    }

    return accesscode;
}

exports.genAccessCode = genAccessCode;

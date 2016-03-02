var express = require('express');
var router = express.Router();
var async = require('async');
var dateFormat = require('dateformat');

var Building = require('../models/building');
var Position = require('../models/position');
var User = require('../models/user');
var Group = require('../models/group');
var Event = require('../models/event');
var restrict = require('../auth/restrict');
var demo = require('../auth/demo');
var timeFormatter = require('../timeformatter');
var vmBuilder = require('../vm');

var activeLink = 'Users';

router.get('/', restrict, function(req, res, next) {
    User.getAll(function(err, users) {
        if (err) {
            return next(err);
        }

        var vm = vmBuilder(req, 'Staff');
        vm.classes['Staff Members'] += 'active opened ';
        vm.users = users;

        res.render('staff/index', vm);
    });
});

router.get('/add', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        },
        function(cb) {
            Group.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        var vm = vmBuilder(req, 'Add Staff Member');
        vm.classes['Staff Members'] += 'active opened ';
        vm.buildings = results[0];
        vm.positions = results[1];
        vm.groups = results[2];

        res.render('staff/add', vm);
    });
});

router.post('/add', restrict, function(req, res, next) {
    async.waterfall([
        function(cb) {
            User.get({ email: req.body.email.toLowerCase() }, cb);
        },
        function(user, cb) {

            if (user) {
                return res.status(409).send('Staff member with ' + user.email + ' email address already exists.');
            }

            var newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                positionid: parseInt(req.body.position),
                buildingid: parseInt(req.body.building),
                room: parseInt(req.body.room),
                groups: req.body.groups,
                experience: parseInt(req.body.experience)
            };

            User.add(newUser, cb);
        }
    ], function(err) {
        if (err) {
            console.log(err);

            return res.status(500).send('Unable to add staff member.');
        }

        res.status(201).send({});
    });
});

router.get('/edit', restrict, function(req, res, next) {

    var userQuery = {};
    if (req.query.email) userQuery.email = req.query.email;
    if (req.query.id) userQuery.id = req.query.id;

    async.parallel([
        function(cb) {
            User.get(userQuery, function(err, user) {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    return next('No user.');
                }

                cb(null, user);
            });
        },
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        }, function(cb) {
            Group.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            console.error(err);
            return res.redirect('/users');
        }

        var vm = vmBuilder(req, 'Edit Staff');
        vm.userEdit = results[0];
        vm.buildings = results[1];
        vm.positions = results[2];
        vm.groups = results[3];

        res.render('staff/edit', vm);
    });
});

router.post('/edit', restrict, function(req, res, next) {
    var reqGroups = req.body.groups;
    delete req.body.groups;
    var updates = req.body;

    console.log(updates);

    // refactor postion, building, and room number into integers
    updates.positionid = parseInt(updates.position);
    delete updates.position;

    updates.buildingid = parseInt(updates.building);
    delete updates.building;

    updates.room = parseInt(updates.room);

    updates.firstname = updates.firstName;
    updates.lastname = updates.lastName;
    delete updates.firstName;
    delete updates.lastName;

    User.update(updates.id, updates, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Unable to edit staff member.');
        }

        res.status(200).send({});
    });

    var newGroups = [];

    if (reqGroups) {
        for (var i = 0; i < reqGroups.length; i++) {
            newGroups.push({
                personid: updates.id,
                groupid: reqGroups[i]
            });
        }
    }

    Group.updateUser({ deleteid: updates.id, groups: newGroups }, function(err) {
        if (err) {
            console.log(err);
        }
    });

});

router.post('/remove', restrict, function(req, res, next) {
    if (!req.body.id) {
        return res.redirect('/');
    } else {
        req.body.id = parseInt(req.body.id);
    }

    User.remove(req.body, function(err) {
        if (err) {
            next(err);
        }

        res.redirect('/users');
    });
});

module.exports = router;

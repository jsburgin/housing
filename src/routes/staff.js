"use strict"

var express = require('express');
var router = express.Router();
var async = require('async');
var dateFormat = require('dateformat');

var Building = require('../models/building');
var Position = require('../models/position');
var User = require('../models/user');
var Group = require('../models/group');
var Event = require('../models/event');
var Schedule = require('../models/schedule');
var restrict = require('../auth/restrict');
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
        },
        function(cb) {
            User.get({ positionid: 1 }, cb);
        },
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        var vm = vmBuilder(req, 'Add Staff Member');
        vm.classes['Staff Members'] += 'active opened ';
        vm.buildings = results[0];
        vm.positions = results[1];
        vm.groups = results[2];
        vm.cds = results[3];

        res.render('staff/add', vm);
    });
});

router.post('/add', restrict, function(req, res, next) {
    async.waterfall([
        function(cb) {
            User.get({ email: req.body.email.toLowerCase() }, cb);
        },
        function(user, cb) {

            if (user[0]) {
                return res.status(409).send('Staff member with ' + user.email + ' email address already exists.');
            }

            User.add(req.body, cb);
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
            User.getOne(userQuery, function(err, user) {
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
        },
        function(cb) {
            User.get({ positionid: 1 }, cb);
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
        vm.cds = results[4];

        res.render('staff/edit', vm);
    });
});

router.post('/edit', restrict, function(req, res, next) {
    var updates = req.body;

    // refactor postion, building, and room number into integers
    updates.positionid = parseInt(updates.position);
    delete updates.position;

    updates.buildingid = parseInt(updates.building);
    delete updates.building;

    if (updates.positionid != 1) {
        updates.cdid = parseInt(updates.cd);
    } else {
        updates.cdid = null;
    }
    delete updates.cd;

    User.update(updates.id, updates, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Unable to edit staff member.');
        }

        res.status(200).send({});
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

router.get('/schedule', function(req, res, next) {
    Schedule.getWebReadySchedule(req.query, function(err, schedule) {
        if (err) {
            return next(err);
        }

        console.log(schedule);

        res.render('staff/schedule', { title: 'Housing', schedule: schedule });
    });
});

module.exports = router;

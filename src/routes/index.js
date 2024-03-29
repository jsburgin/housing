"use strict"

var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');
var dateFormat = require('dateformat');

var restrict = require('../auth/restrict');
var User = require('../models/user');
var Position = require('../models/position');
var Building = require('../models/building');
var Group = require('../models/group');
var Event = require('../models/event');
var Schedule = require('../models/schedule');
var timeFormatter = require('../timeformatter');
var vmBuilder = require('../vm');

router.get('/', restrict, function(req, res, next) {
    var viewModel = vmBuilder(req, 'Home');

    viewModel.classes['Calendar'] += 'active opened';

    res.render('index', viewModel);
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.json({
                loginStatus: 'invalid'
            });
        }

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            req.session.justLoggedIn = true;

            res.json({
                loginStatus: 'success',
                redirectUrl: req.session.redirectTo || '/'
            });

        });

    })(req, res, next);
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/add', function(req, res, next) {
    async.parallel([
        function(cb) {
            Position.getAll(cb);
        },
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Group.getAll(cb);
        },
        function(cb) {
            User.get({ positionid: 1 }, cb);
        }
    ], function(err, results) {
        if (err) {
            return res.redirect('/');
        }

        var vm = vmBuilder(req, 'Add Event');
        vm.classes['Calendar'] += 'active opened';
        vm.positions = results[0];
        vm.buildings = results[1];
        vm.groups = results[2];
        vm.cds = results[3];

        res.render('calendar/add', vm);
    });

});

router.post('/add', restrict, function(req, res, next) {
    Event.add(req.body, function(err) {
        if (err) {
            return res.status(500).send('Unable to create event');
        }

        res.status(200).send({});
    });
});

router.get('/edit', restrict, function(req, res, next) {
    var linkingId = req.query.id;

    if (linkingId) {
        async.parallel([
            function(cb) {
                Event.getHeaders({ linkingId: linkingId }, cb);
            },
            function(cb) {
                Event.get({ linkingId: linkingId }, cb);
            },
            function(cb) {
                Position.getAll(cb);
            },
            function(cb) {
                Building.getAll(cb);
            },
            function(cb) {
                Group.getAll(cb);
            },
            function(cb) {
                User.get({ positionid: 1 }, cb);
            }
        ], function(err, results) {
            if (err) {
                return next(err);
            }

            if (results[0].length == 0) {
                return next();
            }

            var vm = vmBuilder(req, 'Modify Event');

            vm.classes['Calendar'] += 'active opened';

            vm.linkingId = linkingId;
            vm.eventHeader = results[0][0];
            vm.events = results[1];
            vm.positions = results[2];
            vm.buildings = results[3];
            vm.groups = results[4];
            vm.cds = results[5];

            return res.render('calendar/edit', vm);
        });

    } else {
        res.redirect('/');
    }
});

router.post('/edit', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Event.remove({ linkingId: req.body.linkingId }, cb);
        },
        function(cb) {
            delete req.body.linkingId;
            Event.add(req.body, cb);
        }
    ], function(err) {
        if (err) {
            return res.status(500).send('Unable to update event.');
        }

        return res.status(200).send({});
    });
});

router.get('/remove', restrict, function(req, res, next) {
    var linkingId = req.query.id;

    if (!linkingId) {
        return res.redirect('/');
    }

    Event.remove({ linkingId: linkingId }, function(err) {
        if (err) {
            return res.redirect('/edit?id' + linkingId);
        }

        return res.redirect('/');
    });
});

router.get('/profile', restrict, function(req, res, next) {
    res.send('Profile Generate...');
});

router.get('/schedule', restrict, function(req, res, next) {
    Schedule.getScheduleInfo(function(err, schedule) {
        if (err) {
            return next(err);
        }

        var vm = vmBuilder(req, 'Schedule Info');

        vm.classes['Calendar'] += 'active opened ';
        vm.schedule = schedule;

        res.render('calendar/scheduler', vm);
    });
});

router.post('/schedule', restrict, function(req, res, next) {
    Schedule.setScheduleInfo(req.body, function(err) {
        if (err) {
            return res.status(500).send('Unable to edit schedule information. Please try again later.');
        }

        res.status(200).send({});
    });
});

module.exports = router;

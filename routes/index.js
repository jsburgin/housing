var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');
var dateFormat = require('dateformat');

var restrict = require('../auth/restrict');
var Position = require('../models/position');
var Building = require('../models/building');
var Group = require('../models/group');
var Event = require('../models/event');
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

        res.render('calendar/add', vm);
    });

});

router.get('/edit', function(req, res, next) {
    var linkingId = req.query.linkingId;

    if (linkingId) {
        var vm = {
            title: 'Edit Event',
            linkingId: linkingId
        };

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
            }
        ], function(err, results) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            }

            if (results[0].length == 0) {
                return res.redirect('/');
            }

            vm.eventHeader = results[0][0];
            vm.events = results[1];
            vm.positions = results[2];
            vm.buildings = results[3];
            vm.groups = results[4];

            return res.render('edit', vm);
        });

    } else {
        res.redirect('/');
    }

});

module.exports = router;

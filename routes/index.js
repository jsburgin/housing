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

var activeLink = 'Calendar';

router.get('/', restrict, function(req, res, next) {
    res.render('index', { title: 'Training Dashboard | University of Alabama Housing', activeLink: activeLink });
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/'}), function(req, res, next) {
    if (req.session.redirectTo) {
        return res.redirect(req.session.redirectTo);
    }

    res.redirect('/');
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/add', function(req, res, next) {
    var vm = {
        title: 'Create Event'
    };

    if (req.session.createError) {
        vm.error = req.session.createError;
        delete req.session.createError;
    }

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

        vm.positions = results[0];
        vm.buildings = results[1];
        vm.groups = results[2];

        res.render('create-event', vm);
    });

});

router.get('/day', function(req, res, next) {
    if (req.query.date) {
        return loadDateView(req.query.date);
    }

    res.send('Error processing event date.');
    function loadDateView(date) {
        async.waterfall([
            function(cb) {
                Event.getHeaders({ date: date }, cb);
            },
            function(eventHeaders, cb) {

                for (var i = 0; i < eventHeaders.length; i++) {
                    var title = eventHeaders[i].title.toLowerCase();
                    if (title.indexOf('dinner') != -1 || title.indexOf('lunch') != -1) {
                        eventHeaders[i].mealColor = "meal-color";
                    } else {
                        eventHeaders[i].mealColor = "";
                    }

                    if (eventHeaders[i].description.length > 99) {
                        eventHeaders[i].longDescription = true;
                    } else {
                        eventHeaders[i].longDescription = false;
                    }

                    eventHeaders[i].startTime = timeFormatter(eventHeaders[i].startTime);
                    eventHeaders[i].endTime = timeFormatter(eventHeaders[i].endTime);

                    if (!eventHeaders[i].location) {
                        eventHeaders[i].location = 'N/A';
                    }
                }

                var vm = {
                    title: 'Manage Day | University of Alabama Housing',
                    header: dateFormat(new Date(date + ' 12:00'), "dddd, mmmm d, yyyy"),
                    date: date,
                    eventHeaders: eventHeaders
                };

                return res.render('day', vm);
            }
        ], function(err) {
            if (err) {
                return next(err);
            }
        });
    }
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

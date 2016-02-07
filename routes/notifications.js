var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');

var restrict = require('../auth/restrict');
var Notification = require('../models/notification');
var Building = require('../models/building');
var Position = require('../models/position');

var activeLink = 'Notifications';

router.get('/', restrict, function(req, res, next) {
    Notification.getAll({ abbr: true },function(err, notifications) {
        var vm = {
            title: 'Push Notifications | University of Alabama Housing',
            activeLink: activeLink
        };

        if (err) {
            console.error(err);
            vm.notifications = [];
            vm.error = 'Unable to retrieve notifications';
            return res.render('notifications/index', vm);
        }

        vm.notifications = notifications;

        res.render('notifications/index', vm);
    });
});


router.get('/create', restrict, function(req, res, next) {
    var vm = {
        title: 'Send Push Notification | University of Alabama Housing',
        activeLink: activeLink
    };

    if (req.session.createError) {
        vm.error = req.session.createError;
        delete req.session.createError;
    }

    async.parallel([
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            return res.redirect('/notifications');
        }

        vm.buildings = results[0];
        vm.positions = results[1];

        res.render('notifications/create', vm);
    });

});

router.post('/create', restrict, function(req, res, next) {
    var pushNotification = req.body;

    Notification.add(pushNotification, function(err) {
        if (err) {
            console.error(err);
            req.session.createError = 'Unable to send push notification';
            return res.redirect('/notifications/create');
        }

        res.redirect('/notifications');
    });

});

module.exports = router;

"use strict"

var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');

var restrict = require('../auth/restrict');
var vmBuilder = require('../vm');
var Notification = require('../models/notification');
var Building = require('../models/building');
var Position = require('../models/position');
var Group = require('../models/group');

var activeLink = 'Notifications';

router.get('/', restrict, function(req, res, next) {
    Notification.getAll({ abbr: true },function(err, notifications) {
        var vm = vmBuilder(req, 'Notification History');
        vm.classes['Notifications'] += 'active opened ';

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


router.get('/send', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Group.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        }
    ], function(err, results) {
        var vm = vmBuilder(req, 'Notifications');

        if (err) {
            return res.redirect('/');
        }

        vm.classes['Notifications'] += 'active opened ';

        vm.buildings = results[0];
        vm.groups = results[1];
        vm.positions = results[2];

        res.render('notifications/create', vm);
    });

});

router.post('/send', restrict, function(req, res, next) {
    var pushNotification = req.body;

    Notification.add(pushNotification, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(200).send({});
    });

});

module.exports = router;

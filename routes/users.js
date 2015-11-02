var express = require('express');
var router = express.Router();
var async = require('async');

var Building = require('../models/building');
var Position = require('../models/position');
var User = require('../models/user');
var restrict = require('../auth/restrict');

router.get('/', restrict, function(req, res, next) {
    User.getAll(function(err, users) {
        if (err) {
            return next(err);
        }

        var vm = {
            title: 'Manage Users',
            users: users
        };

        res.render('users/index', vm);
    });
});

router.get('/create', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        var vm = {
            title: 'Add User',
            buildings: results[0],
            positions: results[1]
        };

        if (req.session.createError) {
            vm.error = req.session.createError;
            delete req.session.createError;
        }

        if (req.session.cachedUser) {
            vm.user = req.session.cachedUser;
            delete req.session.cachedUser;
        }

        res.render('users/create', vm);
    });
});

router.post('/create', restrict, function(req, res, next) {
    async.waterfall([
        function(cb) {
            User.emailUsed(req.body.email.toLowerCase(), cb);
        },
        function(emailUsed, cb) {

            if (emailUsed) {
                req.session.createError = 'There is already an account associated with that email address.';
                req.session.cachedUser = req.body;
                return res.redirect('/users/create');
            }

            var newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                positionid: parseInt(req.body.position),
                buildingid: parseInt(req.body.building)
            };

            User.add(newUser, cb);
        }
    ], function(err) {
        if (err) {
            req.session.createError = 'There was an error creating the new user';
            res.redirect('/users/create');
        }

        res.redirect('/users');
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');

var restrict = require('../auth/restrict');
var Position = require('../models/position');
var Building = require('../models/building');
var Group = require('../models/group');

var activeLink = 'Calendar';

router.get('/', restrict, function(req, res, next) {
    res.render('index', { title: 'Housing', activeLink: activeLink });
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

module.exports = router;

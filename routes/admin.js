var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');

var restrict = require('../auth/restrict');
var Building = require('../models/building');
var Position = require('../models/position');

router.get('/', restrict, function(req, res, next) {
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
			title: 'Admin Panel',
			buildings: results[0],
			positions: results[1]
		};

		res.render('admin/index', vm);	
	});
});

router.get('/add/building', restrict, function(req, res, next) {
	var vm = {
		title: 'Add Building'
	};

	if (req.session.createError) {
		vm.error = req.session.createError;
		delete req.session.createError;
	}


	res.render('admin/add-building', vm);
});

router.post('/add/building', restrict, function(req, res, next) {

	req.body.name = req.body.name.toLowerCase().replace( /\b\w/g, function(c) {
		return c.toUpperCase();
	});

	async.waterfall([
		function(cb) {
			Building.get({ name: req.body.name }, cb);	
		},
		function(building, cb) {
			if (building) {
				req.session.createError = 'A building with that name already exists';
				return res.redirect('/admin/add/building');
			}

			cb(null);
		},
		function(cb) {
			Building.add(req.body, cb);
		}
	], function(err) {
		if (err) {
			req.session.createError = 'Unable to add building.';
			return res.redirect('/add/building');
		}

		res.redirect('/admin');
	});

});

module.exports = router;

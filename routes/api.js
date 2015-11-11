var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var restrict = require('../auth/restrict');
var postOffice = require('../postoffice');

router.get('/events', function(req, res, next) {
    Event.getAll(function(err, events) {
    	if (err) {
    		return res.send('Unable to find any events.');
    	}

    	res.json(events);
    });
});

router.get('/events/?:id', function(req, res, next) {
	res.send('hello world');
});

router.get('/emails', function(req, res, next) {
	postOffice.getEmailLog(function(err, results) {
		if (err) {
			console.error(err);
			return res.send('Unable to retrieve email log.');
		}

		res.json(results);
	});
});

module.exports = router;
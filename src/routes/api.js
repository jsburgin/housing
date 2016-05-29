var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var restrict = require('../auth/restrict');
var postOffice = require('../postoffice');
var User = require('../models/user');
var Schedule = require('../models/schedule');

router.get('/schedule', function(req, res, next) {
    var queryObject = {};

    if (req.query.id) {
        queryObject.id = req.query.id;
    } else if (req.query.email) {
        queryObject.email = req.query.email;
    } else {
        return res.end(res.writeHead(400, 'Invalid paraemters for event fetch.'));
    }

    Schedule.get(queryObject, function(err, schedule) {
        if (err) {
            return res.status(204).send('No schedule found.');
        }

        return res.json(schedule);
    });

});

router.get('/eventHeaders', restrict, function(req, res, next) {
    Event.getHeaders({}, function(err, eventHeaders) {
        if (err) {
            console.log(err);
            return res.status(500).send('Unabel to fetch events.');
        }

        return res.status(200).send(eventHeaders);
    });
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

router.get('/users', function(req, res, next) {
    var email = req.body.email;

    if (email) {
        User.get({ email: email }, function(err, user) {
            if (err) {
                return res.status(400).send('Unable to retrieve user.');
            }

            res.json(user);
        });
    } else {
        res.status(400).send('Unable to retrieve user.');
    }
});

module.exports = router;

"use strict"

var express = require('express');
var router = express.Router();
var config = require('config');
var async = require('async');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
    config.get('google.clientId'),
    config.get('google.clientSecret'),
    config.get('redirectUrl')
);

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

router.get('/emails', restrict, function(req, res, next) {
    postOffice.getEmailLog(function(err, results) {
        if (err) {
            console.error(err);
            return res.send('Unable to retrieve email log.');
        }

        res.json(results);
    });
});

router.post('/authenticate', function(req, res, next) {
    if (!req.body.idToken || !req.body.type) {
        return res.status(400).send('Please provide valid a valid idToken and device type.');
    }

    /**
     * Checks if google authentication was valid, and if successful returns user data and apiKey
     */
    async.waterfall([
        function(cb) {
            let clientId = "";

            switch(req.body.type) {
                case 'ios':
                    clientId = config.get('google.iOSClientId');
                    break;
                case 'android':
                    clientId = config.get('google.androidClientId');
                    break;
                default:
                    return res.status(400).send('Device type provided is not valid.');
            }

            oauth2Client.verifyIdToken(req.body.idToken, clientId, function(err, loginTicket) {
                if (err) {
                    return res.status(401).send('User verification failed.');
                }

                // successful google verification, proceed to local verification
                return cb(null, loginTicket.getPayload());
            });
        }, function(googleUserData, cb) {

            console.log(googleUserData.email);

            User.get({ email: googleUserData.email }, function(err, user) {
                if (err) {
                    return cb(err);
                }

                if (!user) {
                    return res.status(401).send('No staff member with that email address exists.');
                }

                return res.json({
                    name: googleUserData.name,
                    email: user.email,
                    building: user.building,
                    position: user.position,
                    apiKey: User.genAccessCode(32)
                });
            });
        }
    ], function(err) {
        console.log(err);
        return res.status(500).send('Unable to verify user at this time.');
    });

});

router.post('/devicetoken', function(req, res, next) {

    if (!req.body.email || !req.body.devicetoken) {
        return res.status(400).send('Please provide an email address and device token.');
    }

    User.setDeviceToken(req.body.email, req.body.devicetoken, function(err) {
        if (err) {
            return res.status(500).send('Unable to set device token at this time.');
        }

        return res.status(200).send('Device token for user successfully set.');
    });

});

module.exports = router;

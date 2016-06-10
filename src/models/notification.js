var async = require('async');
var config = require('config');
var apn = require('apn');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var postOffice = require('../postoffice');
var User = require('./user');

var options = {
    cert: config.get('pushNotifications.apnCert'),
    key: config.get('pushNotifications.apnKey')
};

exports.getAll = function(options, next) {
    mongo.retrieveSorted({}, 'notifications', { time: -1 }, function(err, notifications) {
        if (err) {
            return next(err);
        }

        next(null, notifications);
    });
};

exports.add = function(notificationData, next) {

    if (!notificationData.message) {
        return next('Must include subject and message for notification.');
    }

    notificationData.prettyTime = dateFormat(notificationData.time, "mm/dd/yyyy h:MM TT");

    var insertObject = {
        data: notificationData,
        collection: 'notifications'
    };

    mongo.insert(insertObject, function(err) {
        if (err) {
            return next(err);
        }

        next(null);
    });

    if (!notificationData.buildings) {
        notificationData.buildings = [];
    }

    if (!notificationData.groups) {
        notificationData.groups = [];
    }

    async.waterfall([
        function(cb) {
            User.getForNotifications(notificationData, cb);
        },
        function(users, cb) {

            var apnConnection = new apn.Connection(options);

            var note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600;
            note.badge = 1;
            note.sound = "ping.aiff";
            note.alert = notificationData.message;
            note.payload = {};

            for (var i = 0; i < users.length; i++) {
                if (users[i].devicetoken != null && users[i].devicetoken != "") {
                    var myDevice = new apn.Device(users[i].devicetoken);
                    apnConnection.pushNotification(note, myDevice);
                }
            }

            cb(null);
        }
    ], function(err) {
        if (err) {
            console.log(err);
        }
    });

};

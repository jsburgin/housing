var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var postOffice = require('../postoffice');
var User = require('./user');

var apn = require('apn');

var options = {
    cert: '/Users/josh/Desktop/housingCertificates/cert.pem',
    key: '/Users/josh/Desktop/housingCertificates/key.pem'
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
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
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "ping.aiff";
            note.alert = notificationData.message;
            note.payload = {};

            for (var i = 0; i < users.length; i++) {
                var deviceToken = users[i].devicetoken.replaceAll(" ", "");
                deviceToken = deviceToken.replace("<", "");
                deviceToken = deviceToken.replace(">", "");

                var myDevice = new apn.Device(deviceToken);
                apnConnection.pushNotification(note, myDevice);
            }

            cb(null);
        }
    ], function(err) {
        if (err) {
            console.log(err);
        }
    });

};

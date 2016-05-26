var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var postOffice = require('../postoffice');
var User = require('./user');

exports.getAll = function(options, next) {
    mongo.retrieveSorted({}, 'notifications', { time: -1 }, function(err, notifications) {
        if (err) {
            return next(err);
        }

        next(null, notifications);
    });
};

exports.add = function(notificationData, next) {

    if (!notificationData.subject || !notificationData.message) {
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
            var emails = [];

            console.log(users);

            for (var i = 0; i < users.length; i++) {
                emails.push({
                    to: users[i].email,
                    subject: notificationData.subject,
                    html: notificationData.message
                });
            }

            // send mail

            cb(null);
        }
    ], function(err) {
        if (err) {
            console.log(err);
        }
    });

};

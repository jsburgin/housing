var async = require('async');
var Notification = require('../models/notification');

exports.listen = function(socket, next) {
    socket.on('notification', function(notification) {
        Notification.add(notification, function(err) {
            if (err) {
                console.log(err);
            }
        });
    });

    socket.on('disconnect', function() {
        next(null);
    });
};

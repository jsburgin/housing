var async = require('async');
var Event = require('../models/event');

exports.calendarSocketManager = function(socket, next) {

    Event.getHeaders({}, function(err, eventHeaders) {
        if (err) {
            return next(err);
        }

        socket.emit('eventHeaders', eventHeaders);
    });

    socket.on('disconnect', function() {
        next(null);
    });
}

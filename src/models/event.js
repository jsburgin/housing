var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var User = require('./user');

function getTime(timeString) {
    var format = timeString.slice(-2);
    var hours = timeString.substring(0, timeString.indexOf(':'));

    timeString = timeString.substr(0, timeString.length - 3);

    if (format == 'AM') {
        if (hours.length == 1) {
            timeString = '0' + timeString;
        } else if (hours == '12') {
            timeString = timeString.substr(2);
            timeString = '00' + timeString;
        }
    } else {
        if (hours != "12") {
            if (hours.length == 1) {
                timeString = timeString.substring(1);
            } else {
                timeString = timeString.substr(2);
            }
            hours = parseInt(hours) + 12;
            timeString = hours + timeString;
        }
    }

    return timeString;
}

function add(eventObject, next) {

    var linkingId = User.genAccessCode();

    async.waterfall([
        function(cb) {
            mongo.retrieve({ linkingId: linkingId }, 'eventHeaders', cb);
        }
    ], function(err, eventHeaders) {
        if (err) {
            return next(err);
        }

        if (eventHeaders.length == 0) {
            return addEvent();
        }

        setTimeout(add, 0, eventObject);
    });

    function addEvent() {
        if (!linkingId) {
            return next('Error generating linkingId.');
        }

        var date = new Date(eventObject.date);

        var eventHeader = {
            title: eventObject.title,
            description: eventObject.description,
            date: dateFormat(date, "yyyy-mm-dd"),
            prettyDate: eventObject.date,
            linkingId: linkingId,
            startTime: null,
            endTime: null,
            staff: eventObject.staff,
            created: new Date()
        };

        if (eventObject.instances.length > 0) {
            eventHeader.startTime = getTime(eventObject.instances[0].startTime);
            eventHeader.endTime = getTime(eventObject.instances[0].endTime);
            eventHeader.location = eventObject.instances[0].location;
        }

        var events = [];

        for (var i = 0; i < eventObject.instances.length; i++) {
            var currentInstance = eventObject.instances[i];

            currentInstance.prettyStartTime = currentInstance.startTime;
            currentInstance.prettyEndTime = currentInstance.endTime;

            currentInstance.startTime = getTime(currentInstance.startTime);
            currentInstance.endTime = getTime(currentInstance.endTime);

            if (currentInstance.startTime < eventHeader.startTime) {
                eventHeader.startTime = currentInstance.startTime
            }

            if (currentInstance.endTime > eventHeader.endTime) {
                eventHeader.endTime = currentInstance.endTime;
            }

            if (currentInstance.location != eventHeader.location) {
                eventHeader.location = 'Conditional';
            }

            currentInstance.title = eventObject.title;
            currentInstance.description = eventObject.description;
            currentInstance.date = eventObject.date;
            currentInstance.linkingId = linkingId;
            currentInstance.experience = parseInt(currentInstance.experience);

            if (!currentInstance.buildings) {
                currentInstance.buildings = [];
            }

            if (!currentInstance.groups) {
                currentInstance.groups = [];
            }

            if (!currentInstance.positions) {
                currentInstance.positions = [];
            }

            currentInstance.buildings = currentInstance.buildings.map(Number);
            currentInstance.positions = currentInstance.positions.map(Number);
            currentInstance.groups = currentInstance.groups.map(Number);

            events.push({ data: currentInstance, collection: 'events' });
        }

        async.parallel([
            function(cb) {
                mongo.insert({ data: eventHeader, collection: 'eventHeaders' }, cb);
            },
            function(cb) {
                async.map(events, mongo.insert, cb);
            }
        ], next);
    }

};

exports.add = add;

exports.getForUser = function(userData, next) {

    var userDisplayName;

    async.waterfall([
        function(cb) {
            User.get(userData, cb);
        },
        function(user, cb) {

            if(!user) {
                return cb('No user matching options exists.');
            }

            userDisplayName = user.firstname + ' ' + user.lastname;

            var query = {
                $and: [
                    { positions: { $in: [user.positionid] } },
                    {
                        $or: [
                            { buildings: { $in: [user.buildingid] } },
                            { groups: { $in: user.groups } }
                        ]
                    },
                    {
                        $or: [
                            { experience: user.experience },
                            { experience: 2 }
                        ]
                    }
                ]
            };
            mongo.eventRetrieve(query, 'events', cb);
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }



        next(null, results, userDisplayName);
    });
};

exports.getHeaders = function(objectData, next) {
    mongo.retrieveSorted(objectData, 'eventHeaders', { date: 1, startTime: 1, created: 1 }, function(err, eventHeaders) {
        if (err) {
            return next(err);
        }

        next(null, eventHeaders);
    });
}

exports.get = function(objectData, next) {
    mongo.retrieveSorted(objectData, 'events', { startTime: 1 }, function(err, events) {
        if (err) {
            return next(err);
        }

        next(null, events);
    });
};

exports.remove = function(objectData, next) {
    async.parallel([
        function(cb) {
            mongo.remove(objectData, 'events', cb);
        },
        function(cb) {
            mongo.remove(objectData, 'eventHeaders', cb);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        next(null);
    });
};

exports.getAll = function(next) {
    mongo.retrieve({}, 'events', function(err, events) {
        next(err, events);
    });
};

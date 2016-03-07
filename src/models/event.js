var async = require('async');
var dateFormat = require('dateformat');

var mongo = require('../mongo');
var User = require('./user');
var timeFormatter = require('../timeformatter');
var Schedule = require('./schedule');

/**
 * Adds new event to database
 * @param {Object}   eventObject
 * @param {Function} next
 */
function add(eventObject, next) {
    var linkingId = User.genAccessCode();

    async.waterfall([
        function(cb) {
            mongo.retrieve({ linkingId: linkingId }, 'eventHeaders', cb);
        },
        function(eventHeaders, cb) {
            if (eventHeaders.length == 0) {
                return cb(null);
            }

            return setTimeout(add, 0, eventObject);
        },
        function(cb) {
            buildEvents(linkingId, eventObject, cb);
        }
    ], function(err, eventHeader, events) {

        if (err) {
            return next(err);
        }

        saveEvents(eventHeader, events);
    });

    function saveEvents(eventHeader, events) {
        async.parallel([
            function(cb) {
                mongo.insert({ data: eventHeader, collection: 'eventHeaders' }, cb);
            },
            function(cb) {
                async.map(events, mongo.insert, cb);
            }
        ], function(err) {
            if (err) {
                return next(err);
            }

            Schedule.cacheSchedules();
            next(null);
        });
    }
};

/**
 * Processes and packages raw event input
 * @param  {String}   linkingId
 * @param  {Object}   eventObject
 * @param  {Function} next
 */
function buildEvents(linkingId, eventObject, next) {
    var sortDate = new Date(eventObject.date);

    var eventHeader = {
        title: eventObject.title,
        description: eventObject.description,
        date: dateFormat(new Date(eventObject.date), "yyyy-mm-dd"),
        sortDate: sortDate,
        prettyDate: eventObject.date,
        linkingId: linkingId,
        startTime: null,
        endTime: null,
        staff: eventObject.staff,
        created: new Date()
    };

    if (eventObject.instances.length > 0) {
        eventHeader.startTime = timeFormatter.getTimeString(eventObject.instances[0].startTime);
        eventHeader.endTime = timeFormatter.getTimeString(eventObject.instances[0].endTime);
        eventHeader.location = eventObject.instances[0].location;
    }

    var events = [];

    for (var i = 0; i < eventObject.instances.length; i++) {
        var currentInstance = eventObject.instances[i];

        var event = {
            title: eventObject.title,
            description: eventObject.description,
            date: dateFormat(new Date(eventObject.date), "yyyy-mm-dd"),
            sortDate: sortDate,
            linkingId: linkingId,
            prettyStartTime: currentInstance.startTime,
            prettyEndTime: currentInstance.endTime,
            buildings: [],
            groups: [],
            positions: []
        };

        for (key in currentInstance) event[key] = currentInstance[key];

        event.startTime = timeFormatter.getTimeString(event.startTime);
        event.endTime = timeFormatter.getTimeString(event.endTime);

        if (event.startTime < eventHeader.startTime) {
            eventHeader.startTime = event.startTime
        }

        if (event.endTime > eventHeader.endTime) {
            eventHeader.endTime = event.endTime;
        }

        if (event.location != eventHeader.location) {
            eventHeader.location = 'Conditional';
        }

        // convert all ids to ints
        event.experience = parseInt(event.experience);
        event.buildings = event.buildings.map(Number);
        event.positions = event.positions.map(Number);
        event.groups = event.groups.map(Number);

        events.push({ data: event, collection: 'events' });
    }

    return next(null, eventHeader, events);
}

function getHeaders(objectData, next) {
    var sort = {
        date: 1,
        startTime: 1,
        created: 1
    };

    mongo.retrieveSorted(objectData, 'eventHeaders', sort, function(err, eventHeaders) {
        if (err) {
            return next(err);
        }

        next(null, eventHeaders);
    });
}

function get(objectData, next) {
    mongo.retrieveSorted(objectData, 'events', { startTime: 1 }, function(err, events) {
        if (err) {
            return next(err);
        }

        next(null, events);
    });
};

function getAll(next) {
    mongo.retrieve({}, 'events', function(err, events) {
        next(err, events);
    });
};

 function remove(objectData, next) {
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

module.exports = {
    add: add,
    buildEvents: buildEvents,
    getHeaders: getHeaders,
    get: get,
    getAll: getAll,
    remove: remove
};

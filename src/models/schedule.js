var Event = require('./event');
var mongo = require('../mongo');
var db = require('../db');
var User = require('./user');
var async = require('async');
var dateformat = require('dateformat');

var caching = false;
var cacheWaiting = false;
var scheduleCache = {};

var scheduleSet = false;
var startDate = new Date('Jan 1 2000');
var endDate = new Date('Dec 31 2099');
var title = 'Housing & Residential Communities Training Schedule';
var description = '';

/**
 * Retrieves schedule from cache or builds it
 * @param  {Object}   userData
 * @param  {Function} next
 */
function get(userData, next) {
    if (userData.id) {
        if (scheduleCache[userData.id]) {
            return next(null, scheduleCache[userData.id]);
        }
    }

    buildSchedule(userData, function(err, schedule) {
        if (err) {
            return next(err);
        }

        scheduleCache[schedule.userId] = schedule;

        schedule.title = title;
        schedule.description = description;

        return next(null, schedule);
    });
}

/**
 * Generates a schedule for a user
 * @param  {Object}   userData
 * @param  {Function} next
 */
function buildSchedule(userData, next) {
    async.waterfall([
        function(cb) {
            User.get(userData, cb);
        },
        function(user, cb) {
            if (!user) {
                return next("Can't generate schedule for user that does not exist.");
            }

            var userFullName = user.firstname + ' ' + user.lastname;

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
                    },
                    { sortDate : { $gte: startDate } },
                    { sortDate : { $lt: endDate } }
                ]
            };

            var exclude = { buildings: 0, groups: 0, positions: 0, _id: 0, experience: 0, linkingId: 0 };
            var sortBy = { date: 1, startTime: 1};

            mongo.retrieveSortedExclude(query, exclude, sortBy, 'events', function(err, events) {
                if (err) {
                    return cb(err);
                }

                return next(null, { userId: user.id, fullName: userFullName, events: events });
            });
        }
    ], function(err, userFullName, events) {
        if (err) {
            return next(err);
        }
    });
}

/**
 * Creates caches of user schedules
 * @return {[type]} [description]
 */
function cacheSchedules(internalCall) {

    // already caching, set flag for next run
    if (caching && !internalCall) {
        cacheWaiting = true;
        return;
    }

    caching = true;

    async.waterfall([
        function(cb) {
            scheduleCache = {};
            mongo.remove({}, 'schedules', cb);
        },
        function(cb) {
            User.getAllIds(cb);
        },
        function(users, cb) {
            async.map(users, buildSchedule, cb);
        },
        function(schedules, cb) {
            for (var i = 0; i < schedules.length; i++) {
                scheduleCache[schedules[i].userId] = schedules[i];
            }

            cb(null);
        }
    ], function(err) {

        if (err) {
            console.log(err);
        }

        if (cacheWaiting == true) {
            cacheWaiting = false;
            process.nextTick(cacheSchedules, true);
        } else {
            caching = false;
        }

    });
}

/**
 * Loads schedule details in to memory
 * @param {Function} next
 */
function loadScheduleInfo(next) {
    mongo.retrieve({}, 'scheduleInfo', function(err, data) {
        if (err) {
            return next(err);
        }

        if (data.length == 0) {
            return next(null);
        }

        scheduleSet = true;
        startDate = data[0].startDate;
        endDate = data[0].endDate;
        title = data[0].title;
        description = data[0].info;


        next(null);
    });
}

/**
 * Sets start time, end time, and information for current schedule
 * @param {Object}   scheduleData
 * @param {Function} next
 */
function setScheduleInfo(scheduleData, next) {
    async.waterfall([
        function(cb) {
            mongo.remove({}, 'scheduleInfo', cb);
        },
        function(cb) {
            scheduleData.startDate = new Date(scheduleData.startDate);

            scheduleData.endDate = new Date(scheduleData.endDate);
            scheduleData.endDate.setDate(scheduleData.endDate.getDate() + 1);

            mongo.insert({ data: scheduleData, collection: 'scheduleInfo' }, cb);
        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        scheduleSet = true;
        startDate = scheduleData.startDate;
        endDate = scheduleData.endDate;
        title = scheduleData.title;
        description = scheduleData.description;

        cacheSchedules();

        return next(null);
    });
}

/**
 * Returns schedule information for updates
 * @param  {Function} next
 * @return {[type]}
 */
function getScheduleInfo(next) {
    if (scheduleSet) {
        var tempEndDate = new Date(endDate.getTime());

        return next(null, {
            startDate: dateformat(startDate, "mmmm d, yyyy"),
            endDate: dateformat(tempEndDate.setDate(tempEndDate.getDate() - 1), "mmmm d, yyyy"),
            title: title,
            description: description
        });
    }

    var now = new Date();

    var templateSchedule = {
        startDate: dateformat(now, "mmmm d, yyyy"),
        endDate: dateformat(now.setDate(now.getDate() + 7), "mmmm d, yyyy"),
        title: '',
        description: ''
    };

    next(null, templateSchedule);
}

module.exports = {
    get: get,
    cacheSchedules: cacheSchedules,
    setScheduleInfo: setScheduleInfo,
    getScheduleInfo: getScheduleInfo,
    loadScheduleInfo: loadScheduleInfo
};

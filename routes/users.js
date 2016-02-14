var express = require('express');
var router = express.Router();
var async = require('async');
var dateFormat = require('dateformat');

var Building = require('../models/building');
var Position = require('../models/position');
var User = require('../models/user');
var Group = require('../models/group');
var Event = require('../models/event');
var restrict = require('../auth/restrict');
var timeFormatter = require('../timeformatter');

var activeLink = 'Users';

router.get('/', restrict, function(req, res, next) {
    User.getAll(function(err, users) {
        if (err) {
            return next(err);
        }

        var vm = {
            title: 'Users | University of Alabama Housing',
            users: users,
            activeLink: activeLink
        };

        res.render('users/index', vm);
    });
});

router.get('/create', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        },
        function(cb) {
            Group.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        var vm = {
            title: 'Add User | University of Alabama Housing',
            buildings: results[0],
            positions: results[1],
            groups: results[2],
            activeLink: activeLink
        };

        if (req.session.createError) {
            vm.error = req.session.createError;
            delete req.session.createError;
        }

        if (req.session.cachedUser) {
            vm.user = req.session.cachedUser;
            delete req.session.cachedUser;
        }

        res.render('users/create', vm);
    });
});

router.post('/create', restrict, function(req, res, next) {
    async.waterfall([
        function(cb) {
            User.get({ email: req.body.email.toLowerCase() }, cb);
        },
        function(user, cb) {

            if (user) {
                req.session.createError = 'There is already an account associated with that email address.';
                req.session.cachedUser = req.body;
                return res.redirect('/users/create');
            }

            var newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                positionid: parseInt(req.body.position),
                buildingid: parseInt(req.body.building),
                room: parseInt(req.body.room),
                groups: req.body.groups,
                experience: parseInt(req.body.experience)
            };

            User.add(newUser, cb);
        }
    ], function(err) {
        if (err) {
            req.session.createError = 'There was an error creating the new user.';
            return res.redirect('/users/create');
        }

        res.redirect('/users');
    });
});

router.get('/edit', restrict, function(req, res, next) {
    var id = req.query.id;

    if (!id) {
        return res.redirect('/users');
    }

    async.parallel([
        function(cb) {
            User.get({ id: id }, function(err, user) {
                if (!user || err) {
                    return cb(err || 'Unable to find user.');
                }

                cb(null, user);
            });
        },
        function(cb) {
            Building.getAll(cb);
        },
        function(cb) {
            Position.getAll(cb);
        }, function(cb) {
            Group.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            console.error(err);
            return res.redirect('/users');
        }

        var vm = {
            title: 'Edit User | University of Alabama Housing',
            user: results[0],
            buildings: results[1],
            positions: results[2],
            groups: results[3],
            activeLink: activeLink
        };

        if (req.session.editError) {
            vm.error = req.session.editError;
            delete req.session.editError;
        }

        res.render('users/edit', vm);
    });
});

router.post('/edit', restrict, function(req, res, next) {
    var reqGroups = req.body.groups;
    delete req.body.groups;
    var updates = req.body;


    // refactor postion, building, and room number into integers
    updates.positionid = parseInt(updates.position);
    delete updates.position;

    updates.buildingid = parseInt(updates.building);
    delete updates.building;

    updates.room = parseInt(updates.room);

    User.update(updates.id, updates, function(err) {
        if (err) {
            console.error(err);
        }

        res.redirect('/users');
    });

    var newGroups = [];

    if (reqGroups) {
        for (var i = 0; i < reqGroups.length; i++) {
            newGroups.push({
                personid: updates.id,
                groupid: reqGroups[i]
            });
        }
    }

    Group.updateUser({ deleteid: updates.id, groups: newGroups }, function(err) {
        if (err) {
            console.log(err);
        }
    });

});

router.post('/remove', restrict, function(req, res, next) {
    if (!req.body.id) {
        return res.redirect('/');
    } else {
        req.body.id = parseInt(req.body.id);
    }

    User.remove(req.body, function(err) {
        if (err) {
            next(err);
        }

        res.redirect('/users');
    });
});


router.get('/schedule', function(req, res, next) {
    if (req.query.email) {
        return buildSchedule({ email: req.query.email });
    }

    if (req.query.id) {
        return buildSchedule({ id: req.query.id });
    }

    res.redirect('/users');

    function buildSchedule(userData) {
        Event.getForUser(userData, function(err, events, userDisplayName) {
            if (err) {
                return next(err);
            }

            var vm = {
                title: userDisplayName + ' - Training Schedule',
                daySet: [],
                userName: userDisplayName
            };

            if (vm.userName.substring(vm.userName.length - 1) == 's') {
                vm.userName += '\'';
            } else {
                vm.userName += '\'s';
            }

            var tempEventHolder = [];

            if (events.length > 0) {
                tempEventHolder.push(processEvent(events[0]));
            }

            function processEvent(currentEvent) {
                var title = currentEvent.title.toLowerCase();
                currentEvent.prettyDate = dateFormat(new Date(currentEvent.date + ' 12:00'), "dddd, mmmm d, yyyy");
                currentEvent.startTime = timeFormatter(currentEvent.startTime);
                currentEvent.endTime = timeFormatter(currentEvent.endTime);



                if (title.indexOf('dinner') != -1 || title.indexOf('lunch') != -1) {
                    currentEvent.mealColor = "meal-color";
                } else {
                    currentEvent.mealColor = "";
                }

                if (currentEvent.description.length > 99) {
                    currentEvent.longDescription = true;
                } else {
                    currentEvent.longDescription = false;
                }

                return currentEvent;
            }

            for (var i = 1; i < events.length; i++) {
                if (events[i].date != tempEventHolder[0].date) {
                    vm.daySet.push(tempEventHolder);
                    tempEventHolder = [];
                }

                tempEventHolder.push(processEvent(events[i]));
            }
            vm.daySet.push(tempEventHolder);

            return res.render('users/schedule-view', vm);
        });
    }
});

module.exports = router;

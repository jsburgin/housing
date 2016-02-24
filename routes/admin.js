var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');

var restrict = require('../auth/restrict');
var Building = require('../models/building');
var Position = require('../models/position');
var Group = require('../models/group');
var Event = require('../models/event');
var User = require('../models/user');
var Notification = require('../models/notification');
var Admin = require('../models/admin');

var activeLink = 'Admin';

router.get('/', restrict, function(req, res, next) {
    async.parallel([
        function(cb) {
            Event.getAll(cb);
        },
        function(cb) {
            User.getAll(cb);
        },
        function(cb) {
            Notification.getAll({}, cb);
        },
        function(cb) {
            Admin.getAll(cb);
        }
    ], function(err, results) {
        if (err) {
            return next(err);
        }

        for (var i = 0; i < results[3].length; i++) {
            delete results[3][i].password;
        }

        var vm = {
            title: 'Admin Dashboard | University of Alabama Housing',
            eventCount: results[0].length,
            userCount: results[1].length,
            notificationCount: results[2].length,
            adminCount: results[3].length,
            admins: results[3],
            activeLink: activeLink
        };

        res.render('admin/index', vm);
    });
});

router.get('/buildings', restrict, function(req, res, next) {
    Building.getAll(function(err, buildings) {

        var vm = {
            title: 'Manage Buildings | University of Alabama Housing',
            data: buildings,
            headers: 'Manage Buildings',
            postURL: '/admin/add/building'
        };

        res.render('admin/table-insert', vm);

    });
});

router.get('/add/building', restrict, function(req, res, next) {
    var vm = {
        title: 'Add Building | University of Alabama Housing',
        activeLink: activeLink
    };

    if (req.session.createError) {
        vm.error = req.session.createError;
        delete req.session.createError;
    }


    res.render('admin/add-building', vm);
});

router.post('/add/building', restrict, function(req, res, next) {

    req.body.name = capitalize(req.body.name);

    async.waterfall([
        function(cb) {
            Building.get({ name: req.body.name }, cb);
        },
        function(building, cb) {
            if (building) {
                req.session.createError = 'A building with that name already exists';
                return res.redirect('/admin/add/building');
            }

            cb(null);
        },
        function(cb) {
            Building.add(req.body, cb);
        }
    ], function(err) {
        if (err) {
            req.session.createError = 'Unable to add building.';
            return res.redirect('/add/building');
        }

        res.redirect('/admin');
    });

});

router.get('/add/position', restrict, function(req, res, next) {
    var vm = {
        title: 'Add Position | University of Alabama Housing',
        activeLink: activeLink
    };

    if (req.session.createError) {
        vm.error = req.session.createError;
        delete req.session.createError;
    }

    res.render('admin/add-position', vm);
});

router.post('/add/position', restrict, function(req, res, next) {
    req.body.name = req.body.name.toUpperCase();

    async.waterfall([
        function(cb) {
            Position.get({ name: req.body.name }, cb);
        },
        function(position, cb) {
            if (position) {
                req.session.createError = 'There is already a postion with that name.';
                return res.redirect('/admin/add/position');
            }

            cb(null);
        },
        function(cb) {
            Position.add(req.body, cb);
        }
    ], function(err) {
        if (err) {
            req.session.createError = 'Unable to add position.'
            return res.redirect('/admin/add/position');
        }

        res.redirect('/admin');
    });
});

module.exports = router;

function capitalize(toCap) {
    return toCap.toLowerCase().replace( /\b\w/g, function(c) {
        return c.toUpperCase();
    });
}

router.get('/add/group', restrict, function(req, res, next) {
    var vm = {
        title: 'Add Group | University of Alabama Housing',
        activeLink: activeLink
    };

    if (req.session.createError) {
        vm.error = req.session.createError;
        delete req.session.createError;
    }

    return res.render('admin/add-group', vm);
});

router.post('/add/group', restrict, function(req, res, next) {
    async.waterfall([
        function(cb) {
            if (req.body.name.toLowerCase() == 'none') {
                req.session.createError = 'Cannot create group with name of "None".';
                return res.redirect('/admin/add/group');
            }
            Group.add(req.body, cb);
        }
    ], function(err, results) {
        if (err) {
            req.session.createError = err;
            return res.redirect('/admin/add/group');
        }

        return res.redirect('/admin');
    });
});

router.get('edit', restrict, function(req, res, next) {
    var id = req.query('id');

    var vm = {
        title: 'Manage Admin | University of Alabama Housing',
        activeLink: activeLink
    };

    if (id) {
        Admin.get({ id: id }, function(err, admin) {
            if (err) {
                return next(err);
            }

            if (!admin) {
                return res.redirect('/admin');
            }

            delete admin.password;
            vm.admin = admin;

            res.render('admin/edit', vm);
        });
    } else {
        res.redirect('/admin');
    }
})

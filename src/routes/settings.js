"use strict"

var express = require('express');
var router = express.Router();

var restrict = require('../auth/restrict');
var vmBuilder = require('../vm');
var Admin = require('../models/admin');
var Event = require('../models/event');

router.get('/', restrict, function(req, res, next) {
    var vm = vmBuilder(req, 'Settings');

    vm.classes['Settings'] += 'active ';

    Admin.getAll(function(err, admins) {
        if (err) {
            vm.admins = [];
            return res.render('settings/index', vm);
        }

        vm.admins = admins;

        res.render('settings/index', vm);
    });
});

router.post('/remove/events', restrict, function(req, res, next) {
    return res.status(202).send({});

    /*Event.removeAll(function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        return res.status(200).send({});
    });*/
});

module.exports = router;

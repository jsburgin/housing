var express = require('express');
var router = express.Router();

var restrict = require('../auth/restrict');
var vmBuilder = require('../vm');
var Admin = require('../models/admin');

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

module.exports = router;

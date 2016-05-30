var express = require('express');
var router = express.Router();

var restrict = require('../auth/restrict');
var vmBuilder = require('../vm');
var Admin = require('../models/admin');

router.get('/register', function(req, res, next) {
    var vm = vmBuilder(req, 'Register for an Account');

    if (req.isAuthenticated()) {
        return res.redirect('/settings');
    }

    return res.render('account/register', vm);
});

router.post('/register', function(req, res, next) {
    Admin.add(req.body, function(err) {
        if (err) {
            return next(err);
        }

        return res.json({
            registerStatus: 'success'
        });
    });
});

router.post('/approve', restrict, function(req, res, next) {
    if (req.body.id) {
        Admin.approve(req.body.id, function(err) {
            if (err) {
                return res.status(500).send('Unable to approve admin.');
            }

            return res.json({
                approveStatus: 'success'
            });
        });
    } else {
        return res.status(400).send('No admin Id provided.');
    }
});

module.exports = router;

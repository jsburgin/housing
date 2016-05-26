var express = require('express');
var router = express.Router();

var restrict = require('../auth/restrict');
var vmBuilder = require('../vm');
var Admin = require('../models/admin');

router.get('/register', function(req, res, next) {
    var vm = vmBuilder(req, 'Register for an Account');

    return res.render('account/register', vm);
});

router.post('/register', function(req, res, next) {
    var newAdmin = {
        fullName: req.body.name.split(" "),
        firstName: this.fullName[0],
        lastName: this.fullName[this.fullName.length - 1],
        email: req.body.email,
        password: req.body.password
    };

    Admin.add(newAdmin, function(err) {
        if (err) {
            return next(err);
        }

        return res.redirect('/');
    });

});

module.exports = router;

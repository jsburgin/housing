var express = require('express');
var router = express.Router();
var passport = require('passport');

var restrict = require('../auth/restrict');

router.get('/', restrict, function(req, res, next) {
    res.render('index', { title: 'Housing' });
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/'}), function(req, res, next) {
    if (req.session.redirectTo) {
        return res.redirect(req.session.redirectTo);
    }
    
    res.redirect('/');
});

module.exports = router;

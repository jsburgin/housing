var passport = require('passport');

module.exports = function(req, res, next) {

    if (req.isAuthenticated()) {
        return next(null);
    }

    var accessedURL = req._parsedOriginalUrl.path;

    if (accessedURL != '/') {
        // store the request url in order to redirect on successful login
        req.session.redirectTo = accessedURL;
        return res.redirect('/');
    }

    var vm = {
        title: 'Please Login'
    };

    res.render('users/login', vm);
};

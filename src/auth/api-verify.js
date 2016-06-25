var User = require('../models/user');

module.exports = function(req, res, next) {
    if (!req.query.apiKey) {
        return res.status(401).send('Please provide an API key.');
    }

    User.getByApiKey(req.query.apiKey, function(err, user) {
        if (err) {
            return res.status(500).send('Unable to process API call at this moment. Please try again.');
        }

        if (!user) {
            return res.status(401).send('Invalid API token. Unable to verify user.');
        }

        req.requester = user;
        return next();
    });
};

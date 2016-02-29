var vmBuilder = require('../vm');

module.exports = function(req, res, next) {
    if (process.env.BUILD == 'Alpha') {
        var vm = vmBuilder(req, 'Restricted');
        return res.render('error/alpha', vm);
    }

    next();
};

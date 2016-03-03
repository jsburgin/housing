var config = require('config');

var vmBuilder = require('../vm');

module.exports = function(req, res, next) {
    var build = '';

    if (config.has('build')) {
        build = config.get('build');
    }

    if (build == 'Alpha') {
        var vm = vmBuilder(req, 'Restricted');
        return res.render('error/alpha', vm);
    }

    next();
};

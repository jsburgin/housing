var async = require('async');
var prompt = require('prompt');

var run = [];

if (process.argv.length > 2) {
    for (var i = 2; i < process.argv.length; i++) {
        switch(process.argv[i].toLowerCase()) {
            case 'createadmin':
                run.push(createAdmin);
                break;
        }
    }   
} else {
    run.push(setup);
}


async.waterfall(run, function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
});

function setup(next) {
    var fs = require('fs');

    async.waterfall([
        function(cb) {
            prompt.start();

            var schema = {
                properties: {
                    run: {
                        message: 'Are you sure you want to proceed with setup? (Y\\n)'
                    }
                }
            };

            prompt.get(schema, cb);
        },
        function(results, cb) {
            var run = results.run.toLowerCase();
            
            if (run == "y" || run == "yes") {
                return cb(null);
            }

            return next(null);
        },
        function(cb) {
            
            var schema = {
                properties: {
                    database: {
                        message: 'Database Name'
                    },
                    user: {
                        message: 'Database Username'
                    },
                    password: {
                        message: 'Database Password',
                        hidden: true
                    }
                }
            };

            prompt.get(schema, cb);
        },
        function(results, cb) {
            console.log(results);
        }
    ], next);
}

function createAdmin(next) {
    var Admin = require('../models/admin');

    async.waterfall([
        function(cb) {
            prompt.start();

            var schema = {
                properties: {
                    firstName : {
                        message: 'First Name'
                    },
                    lastName: {
                        message: 'Last Name'
                    },
                    email: {
                        message: 'Email'
                    },
                    password: {
                        message: 'Password',
                        hidden: true
                    }
                }
            };

            prompt.get(schema, cb);
        },
        function(results, cb) {
            Admin.add(results, cb);
        }
    ], next);
}
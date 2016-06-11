var nodemailer = require('nodemailer');
var config = require('config');

var mongo = require('../mongo');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.get('gmail.email'),
        pass: config.get('gmail.password')
    }
});

exports.sendMail = function(email, next) {
    var mailOptions = {
        from: 'UA Housing <uahousingtest@gmail.com>',
        to: email.to,
        subject: email.subject,
        html: email.html
    };

    if (config.get('sendMail') == false) {
        return next(null);
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            return next(err);
        }

        info.body = mailOptions;
        logMail(info);

        return next(null);
    });
};

function logMail(email) {
    var insertObject = {
        data: email,
        collection: 'emails'
    }
    mongo.insert(insertObject, function(err, result) {
        if (err) {
            console.error(err);
        }
    });
}

exports.getEmailLog = function(next) {
    mongo.retrieve({}, 'emails', function(err, results) {
        return next(err, results);
    });
}

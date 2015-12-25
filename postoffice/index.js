var nodemailer = require('nodemailer');
var mongo = require('../mongo');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'uahousingtest@gmail.com',
		pass: 'Ripzeke2015'
	}
});

exports.sendMail = function(email, next) {
	var mailOptions = {
		from: 'UA Housing <uahousingtest@gmail.com>',
		to: email.to,
		subject: email.subject,
		html: email.html
	};

	transporter.sendMail(mailOptions, function(err, info) {
		console.log('mail sent...');
		info.body = mailOptions;
		logMail(info);

		return next(err);
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
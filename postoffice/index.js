var nodemailer = require('nodemailer');

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

	console.log(mailOptions);

	transporter.sendMail(mailOptions, function(err, info) {
		return next(err);
	});
};
var diagnostics = require('../managers/diagnostics');
var calendar = require('../managers/calendar');
var notification = require('../managers/notification');
var eventCreation = require('../managers/eventcreation');

module.exports = function(io) {
	io.on('connection', function(socket) {
			
		// received event from notification page, outsource to diagnostics
		socket.on('notificationEngine', function(run) {
			diagnostics.notificationDiagnostics(socket, function(err) {
				if (err) {
					console.log(err);
				}
			});
		});

		// received event from calendar page, outsource to calendar socket manager
		socket.on('calendarEngine', function(run) {
			calendar.calendarSocketManager(socket, function(err) {
				if (err) {
					console.log(err);
				}
			});
		});

		// received event from notification creation page, outsource for notification creation
		socket.on('notificationCreation', function(run) {
			notification.listen(socket, function(err) {
				if (err) {
					console.log(err);
				}
			});
		});

		// received event from event creation page, outsource to event manager
		socket.on('eventCreation', function(run) {
			eventCreation.listen(socket, function(err) {
				if (err) {
					console.log(err);
				}
			});
		});

	});
}

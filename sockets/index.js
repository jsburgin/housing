var diagnostics = require('../diagnostics');

module.exports = function(io) {
	io.on('connection', function(socket) {
			

		socket.on('notificationEngine', function(run) {
			diagnostics.notificationDiagnostics(socket, function(err) {
				if (err) {
					console.log(err);
				}
			});
		});

	});
}
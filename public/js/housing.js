$(function() {

	// make the user confirm user deletion
	$('.remove-user-form').submit(function(event) {
		var submit = confirm('Are you sure you want to delete the user?');

		if (submit) {
			$('.remove-user-form').sumbit();
		}

		event.preventDefault();
	});

});

function HousingManager(settings) {
	var pageType;
	var socket = io();

	if (settings.page) {
		pageType = settings.page;
	}


	if (pageType == 'Notifications' ) {
		socket.emit('notificationEngine', true);
	}

	socket.on('notificationGraphData', function(data) {

		console.log(data);

		
		var chart = c3.generate({
			bindto: '#notification-chart',
			data: {
				x: 'x',
				columns: [
					data.x,
					data.y
				]
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%m/%d/%Y'
					}
				}
			},
			tooltip: {
				show: true
			},
			color: {
				pattern: ['#AB2D4E']
			},
		});

		$('#notification-chart').prepend('<h3>Notification Frequency</h3>');
	});
}

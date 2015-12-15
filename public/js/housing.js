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

	// call necessary method based on page & enable socket.io connections
	switch(pageType) {
		case 'Notifications':
			socket.emit('notificationEngine', true);
			break;
		case 'Calendar':
			socket.emit('calendarEngine', true);
			calendarManager();
			break;
		case 'NotificationCreation':
            socket.emit('notificationCreation', true);
			notificationCreator();
			break;
		case 'Users':
			loadDataTables('.user-accounts');
			break;
	}

	// socket.io events //

	socket.on('notificationGraphData', function(data) {
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

	// calendar events

	function calendarManager() {
		$('#calendar').fullCalendar({
			defaultDate: new Date().toString(),
			editable: false,
			eventLimit: true,
			fixedWeekCount: false,
			aspectRatio: 1.7
		});

		$('.fc-day').click(function(event) {
			var dateSelected = $(event.target).attr('data-date');
			dayClicked(dateSelected);
		});

		$('.fc-day-number').click(function(event) {
			var dateSelected = $(event.target).attr('data-date');
			dayClicked(dateSelected);
		});

		function dayClicked(date) {
			console.log()
		}
	}

	function notificationCreator() {
		$('.notification-form').submit(function(e) {
			e.preventDefault();
			e.returnValue = false;

			var notification = {};

			notification.subject = $('.notification-subject').val();
			notification.message = $('.notification-message').val();

            notification.toEmail = $('.email-checkbox').prop('checked');
            console.log(notification.toEmail);
			notification.positions = [];
			notification.buildings = [];

			$('.position-checkbox').each(function(index, item) {
				if (item.checked) {
					var itemValue;
					notification.positions.push($(item).val());
				}
			});

			$('.building-checkbox').each(function(index, item) {
				if (item.checked) {
					notification.buildings.push($(item).val());
				}
			});

            socket.emit('notification', notification);
            window.location.replace('/notifications');
		});
	}

	function loadDataTables(tableContainer) {
		$(tableContainer).DataTable();
	}
}
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
			loadDataTables('.user-accounts', 'notifications');
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
			loadDataTables('.user-accounts', 'users');
			break;
		case 'eventCreation':
			socket.emit('eventCreation', true);
			
			socket.on('eventPackage', function(eventPackage) {
				eventCreation(eventPackage.positions, eventPackage.buildings, eventPackage.groups);
			});

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
			// filter dayClicked data
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

	function loadDataTables(tableContainer, dataType) {
		$(tableContainer).DataTable({
			responsive: true,
			"oLanguage": {
     	 		"sLengthMenu": "Show _MENU_",
     	 		"sZeroRecords": "No " + dataType + " found.",
     	 		"sInfo": "Showing _START_ to _END_ of _TOTAL_ total " + dataType + ".",
     	 		"sInfoFiltered": "",
    		}
		});
		$('.hide-table').css('visibility', 'visible');
	}

	function eventCreation(positions, buildings, groups) {
		console.log(buildings);

		var instances = [];
		var instanceCount = 1;
		var checkboxCount = 1;

		function generateSelector(selectorType) {
			var selector = '';
			selector += '<div class="event-checkbox-collection ' + selectorType + '-selection">';
			selector += '<div href="#"><p class="link-sim toggle-all" >Toggle All</p></div>';
			var tempCollectionList;
			switch(selectorType) {
				case 'position':
					tempCollectionList = positions;
					break;
				case 'building':
					tempCollectionList = buildings;
					break;
				case 'group':
					tempCollectionList = groups;
					break;
				default:
					return '';			
			}

			for (var i = 0; i < tempCollectionList.length; i++) {
				selector += '<div class="checkbox-selection">';
				selector += '<input id="checkbox-' + checkboxCount + '" type="checkbox" class="checkbox ' + selectorType + '-checkbox" value="' + tempCollectionList[i].id + '" />';
				selector += '<label class="checkbox-label" check-selector="checkbox-' + checkboxCount +'">' + tempCollectionList[i].name + '</label>';
				selector += '</div>';
				checkboxCount++;
			}
			selector += '</div>';
			return selector; 	
		}

		function addInstanceBlock(dataType) {
			$('.instance-block').prepend('<div class="filter-instance ' + dataType + '-instance instance-' + instanceCount + '" instance-id="' + instanceCount + '"">');
			$('.instance-' + instanceCount).append('<div class="remove-instance"><i class="fa fa-close"></i></div>');
			$('.instance-' + instanceCount).append('<h6 class="event-instance-header">For Positions:</h6>');
			$('.instance-' + instanceCount).append(generateSelector('position'));
			if (dataType == 'building') {
				$('.instance-' + instanceCount).append('<h6 class="event-instance-header">in Buildings:</h6>');
				$('.instance-' + instanceCount).append(generateSelector('building'));	
			} else {
				$('.instance-' + instanceCount).append('<h6 class="event-instance-header">in Groups:</h6>');
				$('.instance-' + instanceCount).append(generateSelector('group'));
			}
			$('.instance-' + instanceCount).append('<h6>containing:</h6><input id="checkbox-' + checkboxCount + '" type="radio" name="experience" value="2" checked="checked" /><label class="checkbox-label" check-selector="checkbox-' + checkboxCount++ + '">New and Returning Staff</label>');
			$('.instance-' + instanceCount).append('<input id="checkbox-' + checkboxCount + '" type="radio" class="new-staff-input" name="experience" value="0" /><label class="checkbox-label" check-selector="checkbox-' + checkboxCount++ + '">New Staff Only</label>');
			$('.instance-' + instanceCount).append('<input id="checkbox-' + checkboxCount + '" type="radio" class="returning-staff-input" name="experience" value="1" /><label class="checkbox-label" check-selector="checkbox-' + checkboxCount++ + '">Returning Staff Only</label>');
			$('.instance-' + instanceCount).append('<label>Location:</label><input type="text" name="location", class="event-location-input">');
			$('.instance-' + instanceCount).append('<label>Start Time:</label><input type="time" name="starttime", class="start-time">');
			$('.instance-' + instanceCount).append('<label>End Time:</label><input type="time" name="endtime", class="end-time">');

			$('.remove-instance').click(function() {
				$(this).parents('.filter-instance').remove();
			})

			$('.toggle-all').click(function() {
				var checkedCount = 0;
				var unCheckedCount = 0;
				$(this).parents('.event-checkbox-collection').find('.checkbox').each(function(index, checkbox) {
					if (checkbox.checked) {
						checkedCount++;
					} else {
						unCheckedCount++;
					}
				});

				$(this).parents('.event-checkbox-collection').find('.checkbox').each(function(index, checkbox) {
					if (checkedCount > unCheckedCount) {
						checkbox.checked = false;
					} else {
						checkbox.checked = true;
					}
				});

			});

			$('.checkbox-label').click(function() {
				var checkboxId = $(this).attr('check-selector');
				var checkedValue = $('#' + checkboxId).prop('checked');
				
				if (checkedValue) {
					$('#' + checkboxId).prop('checked', false);
				} else {
					$('#' + checkboxId).prop('checked', true);
				}
			});

			++instanceCount;	
		}

		$('.event-creation-form .add-building-instance').click(function() {
			// add instance for building based identifcation
			addInstanceBlock('building');
		});

		$('.event-creation-form .add-group-instance').click(function() {
			// add instance for group based indentification
			addInstanceBlock('group');
		});

		$('.event-creation-form').submit(function(event) {
			generateEvent(function(eventData) {
				console.log(eventData);
				socket.emit('newEvent', eventData);
				// redirect here
			});

			socket.on('eventCreated', function() {
				return window.location.replace('/');
			});

			event.preventDefault();
		});

		function generateEvent(next) {
			var eventData = {
				title: $('.event-name-input').val(),
				description: $('.event-description-input').val(),
				date: $('.event-date-input').val(),
				instances: []
			};

			$.each($('.filter-instance'), function(index, filter) {
				var newInstance = {
					startTime: $(filter).find('.start-time').val(),
					endTime: $(filter).find('.end-time').val(),
					location: $(filter).find('.event-location-input').val(),
					experience: $(filter).find(),
					positions: [],
					buildings: [],
					groups: [],
					experience: 2
				};

				if ($(filter).find('.new-staff-input').is(':checked')) {
					newInstance.experience = 0;
				} else if ($(filter).find('.returning-staff-input').is(':checked')) {
					newInstance.experience = 1;
				}
				
				$.each($(filter).find('.position-checkbox'), function(index, checkbox) {
					if (checkbox.checked) {
						newInstance.positions.push(parseInt($(checkbox).val()));
					}
				});

				if ($(filter).attr('class').indexOf('building-instance') != -1) {
					newInstance.buildings = [];
					$.each($(filter).find('.building-checkbox'), function(index, checkbox) {
						if (checkbox.checked) {
							newInstance.buildings.push(parseInt($(checkbox).val()));
						}
					});
					
				} else {
					$.each($(filter).find('.group-checkbox'), function(index, checkbox) {
						if (checkbox.checked) {
							newInstance.groups.push(parseInt($(checkbox).val()));
						}
					});
				}
			
				eventData.instances.push(newInstance);
			});

			
			next(eventData);
		}
	}
}
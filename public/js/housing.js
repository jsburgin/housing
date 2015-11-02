function HousingManager(settings) {
	var allUsers;
	var userCollections = [];
	var currentCollection = 0;
	var reversed = false;
	var lastClicked;

	/*var socket = io();

	if (settings.users) {
		socket.emit('getAllUsers');
	}

	socket.on('allUsers', function(users) {
		allUsers = users;	
		printUsers(['name']);
	});*/

	function printUsers(sortBy) {

		if (sortBy != null) {
			selectionSort(allUsers, sortBy, reversed);	
		}
		
		userCollections = [];

		var count = 0;
		while (count < allUsers.length) {
			userCollections.push(allUsers.slice(count, count += 40));
		}

		$('.page-links').html('');
		for (var i = 1; i <= userCollections.length; i++) {
			$('.page-links').append('<a class="pagination-link" href="#">' + i + '</a>');
		}

		$('.user-accounts tbody').html('');

		for (var i = 0; i < userCollections[currentCollection].length; i++) {
			$('.user-accounts tbody').append('<tr><td user="' + userCollections[currentCollection][i].id + '" class="center-icon"><i class="fa fa-pencil-square-o"></i></td><td>' 
			+ userCollections[currentCollection][i].lastname + ', ' + userCollections[i].firstname + '</td><td>' 
			+ userCollections[currentCollection][i].email + '</td><td>' 
			+ userCollections[currentCollection][i].position + '</td><td>' 
			+ userCollections[currentCollection][i].building + '</td></tr>');
		}	
	}

	$('body').on('click', '.pagination-link', function() {
    	var number = parseInt($(this).text());
    	currentCollection = number - 1;

    	printUsers();
	});

	$('body').on('click', '.center-icon', function() {
    	var number = parseInt($(this).attr('user'));
    	window.location.href = '/users/edit/' + number;
	});

	$('.sort-click').click(function() {

		var text = $(event.currentTarget).text();

		if (text == lastClicked && !reversed) {
			reversed = true;
		} else {
			reversed = false;
		}

		lastClicked = text;

		switch(text) {
			case 'Name':
				printUsers('name');
				break;
			case 'Email':
				printUsers('email');
				break;
			case 'Position':
				printUsers('position');
				break;
			case 'Building':
				printUsers('building');
				break;
		}

	});
}

function selectionSort(lyst, sortBy, reversed) {
	for (var i = 0; i < lyst.length; i++) {
		var currentMin = i;


		for (var j = i + 1; j < lyst.length; j++) {

			var first = lyst[j][sortBy],
				second = lyst[currentMin][sortBy];

			if (!reversed) {
				if (first < second) {
					currentMin = j;
				}	
			} else {
				if (first > second) {
					currentMin = j;
				}
			}
			
		}

		if (currentMin != i) {
			var temp = lyst[i];
			lyst[i] = lyst[currentMin];
			lyst[currentMin] = temp;
		}
	}
}
$(function() {

	// make the user confirm user deletion
	$('.remove-user-form').submit(function(event) {
		var submit = confirm('Are you sure you want to delete the user?');

		if (submit) {
			$('.remove-user-form').sumbit();
		}

		event.preventDefault();
	});

	$('.notification-time').each(function(index) {
		var notificationDate = new Date(parseInt($(this).html()));
		$(this).html(getPrettyTime(notificationDate));
	});

	var activeLink = $('.hidden-active-link').attr('active-link');

	if (activeLink) {
		$('.housing-main-menu li a').each(function(index) {
			if ($(this).html().toLowerCase() == activeLink.toLowerCase()) {
				$(this).addClass('active-link');
			}
		});
	}

});

function getPrettyTime(dateObj) {

	var month   = dateObj.getMonth() + 1,
		day	    = dateObj.getDate().toString(),
		year    = dateObj.getFullYear().toString(),
		hour    = dateObj.getHours(),
		minutes = dateObj.getMinutes().toString(),
		clock   = 'A.M.';

	if (hour >= 12) {
		clock = 'P.M.';
	}

	if (hour > 12) {
		hour -= 12;
	} else if (hour == 0) {
		hour = 12;	
	}

	month = month.toString();
	hour  = hour.toString();

	if (minutes.length == 1) {
		minutes = '0' + minutes;
	}

	return month + '/' + day + '/' + year + ' ' + hour + ':' + minutes + ' ' + clock;	
}
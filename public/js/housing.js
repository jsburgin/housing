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
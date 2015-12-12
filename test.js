var Event = require('./models/event');

/*var newEvent = {
	title: 'Traning Session 1',
	description: 'A training session for RA\'s & FA\'s in Paty',
	positions: [1, 2],
	buildings: [4]
};

Event.add(newEvent, function(err) {
	if (err) {
		console.log(err);
	}
});*/

Event.getForUser(12, function(err, results) {
	if (err) {
		return console.error(err);
	}

	console.log(results);
});
var colors = require('colors');
module.exports = function() {
	var rollTide = [" ____            ___    ___       ______        __",
				"/\\  _`\\         /\\_ \\  /\\_ \\     /\\__  _\\__    /\\ \\",
				"\\ \\ \\_\\ \\    ___\\//\\ \\ \\//\\ \\    \\/_/\\ \\/\\_\\   \\_\\ \\     __",
				" \\ \\ ,  /   / __`\\\\ \\ \\  \\ \\ \\      \\ \\ \\/\\ \\  /'_` \\  /'__`\\",
				"  \\ \\ \\\\ \\ /\\ \\_\\ \\\\_\\ \\_ \\_\\ \\_     \\ \\ \\ \\ \\/\\ \\_\\ \\/\\  __/",
				"   \\ \\_\\ \\_\\ \\____//\\____\\/\\____\\     \\ \\_\\ \\_\\ \\___,_\\ \\____\\",
				"    \\/_/\\/ /\\/___/ \\/____/\\/____/      \\/_/\\/_/\\/__,_ /\\/____/", ""];
				

	process.stdout.write('\033c');

	for (var i = 0; i < rollTide.length; i++) {
		console.log(rollTide[i]);
	}
}
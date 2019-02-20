function timeBetween(dateA, dateB) {
	const seconds = Math.floor((dateB - dateA) / 1000);
	let interval = Math.floor(seconds / 31536000);
	if (interval > 2) {
		return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 2) {
		return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 2) {
		return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 2) {
		return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 2) {
		return interval + " minutes";
	}
	return Math.floor(seconds) + " seconds";
}

function timeSince(date) {
	return timeBetween(date, new Date());
}

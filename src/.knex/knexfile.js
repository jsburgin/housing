require('dotenv').config({ path: '../../.env' });

module.exports = {
	development: {
		client: 'postgresql',
		connection: process.env.DATABASE_URL
	}
};

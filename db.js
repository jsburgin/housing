require('dotenv').load();

var db = require('knex')({
	client: 'postgresql',
    connection: {
      database: process.env.DATABASE,
      user: 	process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    }
});

module.exports = db;
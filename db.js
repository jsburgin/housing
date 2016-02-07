require('dotenv').load();

var db = require('knex')({
    client: 'postgresql',
    connection: process.env.DATABASE_URL
});

module.exports = db;

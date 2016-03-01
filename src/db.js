require('dotenv').config({silent: true});

var db = require('knex')({
    client: 'postgresql',
    connection: process.env.DATABASE_URL
});

module.exports = db;

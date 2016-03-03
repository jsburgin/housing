var config = require('config');

var db = require('knex')({
    client: 'postgresql',
    connection: config.get('db.postgres')
});

module.exports = db;

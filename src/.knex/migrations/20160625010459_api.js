
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('apikey', function(table) {
            table.increments();
            table.integer('personid').references('person.id').notNullable();
            table.string('key').notNullable();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('apikey')
    ]);
};

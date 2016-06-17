
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('person', function(table) {
            table.integer('cdid').references('person.id');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('person', function(table) {
            table.dropColumn('cdid');
        })
    ]);
};

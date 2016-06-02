
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('person', function(table) {
            table.string('devicetoken');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('person', function(table) {
            table.dropColumn('devicetoken');
        })
    ]);
};

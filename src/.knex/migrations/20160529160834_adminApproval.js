
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('admin', function(table) {
            table.integer('approved').notNullable();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('admin', function(table) {
            table.dropColumn('approved');
        })
    ]);
};

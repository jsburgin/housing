
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('admin', function(table) {
            table.increments();
            table.string('firstname').notNullable();
            table.string('lastname').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
        }),

        knex.schema.createTable('building', function(table) {
            table.increments();
            table.string('name').notNullable();
        }),

        knex.schema.createTable('position', function(table) {
            table.increments();
            table.string('name').notNullable();
        }),

        knex.schema.createTable('person', function(table) {
            table.increments();
            table.string('firstname').notNullable();
            table.string('lastname').notNullable();
            table.string('email').notNullable();
            table.integer('positionid').notNullable().references('position.id');
            table.integer('buildingid').notNullable().references('building.id');
            table.integer('experience').notNullable();
            table.string('room');
            table.string('accesscode');
        }),

        knex.schema.createTable('staffgroup', function(table) {
            table.increments();
            table.string('name').notNullable();
        }),

        knex.schema.createTable('staffgroupperson', function(table) {
            table.integer('personid').notNullable().references('person.id');
            table.integer('staffgroupid').notNullable().references('staffgroup.id');
        }),

        knex.schema.createTable('session', function(table) {
            table.string('sid').notNullable();
            table.json('sess').notNullable();
            table.timestamp('expire').notNullable();
        }),

        knex.schema.raw('ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;')
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('admin'),
        knex.schema.dropTable('staffgroupperson'),
        knex.schema.dropTable('person'),
        knex.schema.dropTable('position'),
        knex.schema.dropTable('building'),
        knex.schema.dropTable('staffgroup'),
        knex.schema.dropTable('session'),
    ]);
};

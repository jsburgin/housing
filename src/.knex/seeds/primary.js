
exports.seed = function(knex, Promise) {

    var bcrypt = require('bcrypt-nodejs');

    var admin = {
        id: 1,
        firstname: 'Development',
        lastname: 'User',
        email: 'dev@uahousing.burgin.io',
        password: bcrypt.hashSync('housing2016')
    };

    var positions = [
        { id: 1, name: 'CD' },
        { id: 2, name: 'FA' },
        { id: 3, name: 'RA' }
    ];

    var buildings = [
        { id: 1, name: 'Blount' },
        { id: 2, name: 'Bryant' },
        { id: 3, name: 'Bryce Lawn' },
        { id: 4, name: 'Burke East' },
        { id: 5, name: 'Burke West' },
        { id: 6, name: 'Harris' },
        { id: 7, name: 'Highlands' },
        { id: 8, name: 'Lakeside East'},
        { id: 9, name: 'Lakeside West' },
        { id: 10, name: 'Paty' },
        { id: 11, name: 'Presidental Village 1' },
        { id: 12, name: 'Presidental Village 2' },
        { id: 13, name: 'Ridgecrest East' },
        { id: 14, name: 'Ridgecrest West' },
        { id: 15, name: 'Riverside' },
        { id: 16, name: 'Somerville' },
        { id: 17, name: 'Tutwiler' }
    ];

    return Promise.join(
        knex('admin').del(),
        knex('admin').insert(admin),
        knex('position').del(),
        knex('position').insert(positions),
        knex('building').del(),
        knex('building').insert(buildings)
    );
};

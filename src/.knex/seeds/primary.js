
exports.seed = function(knex, Promise) {

    var bcrypt = require('bcrypt-nodejs');

    var admin = {
        firstname: 'Development',
        lastname: 'User',
        email: 'dev@uahousing.burgin.io',
        password: bcrypt.hashSync('housing2016'),
        approved: 1
    };

    var positions = [
        { name: 'CD' },
        { name: 'FA' },
        { name: 'RA' }
    ];

    var buildings = [
        { name: 'Blount' },
        { name: 'Bryant' },
        { name: 'Bryce Lawn' },
        { name: 'Burke East' },
        { name: 'Burke West' },
        { name: 'Friedman' },
        { name: 'Harris' },
        { name: 'Highlands' },
        { name: 'Lakeside East'},
        { name: 'Lakeside West' },
        { name: 'Parham' }
        {  name: 'Paty' },
        {  name: 'Presidental Village 1' },
        {  name: 'Presidental Village 2' },
        {  name: 'Ridgecrest East' },
        {  name: 'Ridgecrest South' },
        {  name: 'Ridgecrest West' },
        {  name: 'Riverside' },
        {  name: 'Somerville' },
        {  name: 'Tutwiler' }
    ];

    var groups = [
        { name: 'House Managers' },
        { name: 'Desk Staff' }
    ];

    return Promise.join(
        knex('admin').del(),
        knex('admin').insert(admin),
        knex('position').del(),
        knex('position').insert(positions),
        knex('building').del(),
        knex('building').insert(buildings),
        knex('staffgroup').insert(groups)
    );
};

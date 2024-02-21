const { Users } =require('../models');

const usersData = [
    {
        id: 0,
        username: null,
        email: null,
        password: null,
    },
];

const seedUsers = () => Users.bulkCreated(usersData);

module.exports = seedUsers;
##University of Alabama Housing Training Application

[![Build Status](https://travis-ci.com/jsburgin/housing.svg?token=2mJiqhzs9KLeywNzb84z&branch=master)](https://travis-ci.com/jsburgin/housing)

The University of Alabama Housing Scheduling & Notification Application is primarily developed to simplify communication and event scheduling for university housing-related training and professional development.

###Installation
Requires Node.js v4.0.0 or greater, PostgreSQL v9.4 or greater, and MongoDB v3.0.4 or greater. Start by installing required npm dependencies:

```
$ git clone https://github.com/jsburgin/housing.git
$ cd ./housing && npm install

Create a new .env file to overwrite database url settings:

```
$ vi .env
```

Your .env file should include a url for both PostgreSQL and MongoDB:

```
DATABASE_URL=postgres://username:password@localhost/databaseName
MONGO_URL=mongodb://localhost:27017/databaseName
```

Run the latest migration and initialize application with data:

```
$ npm install -g knex
$ cd src/.knex
$ knex migrate:latest
$ knex seed:run
```

Return to the root of the respository and run the application:

```
$ cd ../../
$ npm start
```

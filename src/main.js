var http = require('http');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var pgSession = require('connect-pg-simple');
var debug = require('debug')('housing:server');
var colors = require('colors');
var cors = require('cors');

require('dotenv').config({silent: true});
var config = require('config');

var authConfig = require('./auth/passport');
var rollTide = require('./rolltide');
var Schedule;

var routes = require('./routes/index');
var staff = require('./routes/staff');
var api = require('./routes/api');
var settings = require('./routes/settings');
var notifications = require('./routes/notifications');

var app = express();

var port = process.env.PORT || '8080';
app.set('port', port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', { pretty: false })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Postgres session initialization
 */
app.use(session({
    store: new (pgSession(session))(),
    secret: config.get('session.secret'),
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

/**
 * Authentification setup
 */
authConfig();
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use('/', routes);
app.use('/staff', staff);
app.use('/api', api);
app.use('/settings', settings);
app.use('/notifications', notifications);

/**
 * 404 Handler, forward error
 */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * Development error handler
 */
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/**
 * Production error handler
 */
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Server setup
 */
var server = http.createServer(app);
server.listen(port);

server.on('listening', startUp);
server.on('error', function(err) {
    throw err;
});

function startUp() {
    rollTide();
    console.log('Startup Succesful'.green);
    console.log('University of Alabama Housing Training now running on port ' + port + '.');

    Schedule = require('./models/schedule');
    Schedule.loadScheduleInfo(function() {
        Schedule.cacheSchedules();
    });
}

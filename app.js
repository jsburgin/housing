var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');

require('dotenv').load();

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');
var notifications = require('./routes/notifications');

var app = express();

var passportConfig = require('./auth/passport');

passportConfig();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view options', { pretty: false })

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'img/favicon.png')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(expressSession({
    store: new (require('connect-pg-simple')(expressSession))(),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/api', api);
app.use('/admin', admin);
app.use('/notifications', notifications);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

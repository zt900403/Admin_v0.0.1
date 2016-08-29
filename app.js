var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var fs = require('fs');


var routes = require('./routes/index');
var users = require('./routes/users');
var noauthAPI = require('./routes/noauthAPI');
var authAPI = require('./routes/authAPI');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'development') {
    app.use(logger('dev'));
} else {
    var log = fs.createWriteStream('../var/log/request.log', { flags: 'a'});
    app.use(logger(':date : :method :url :status',{stream: log }));

}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("keyboard cat"));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1*60*60*1000 },
    store: new MongoStore({
        url: 'mongodb://zt900403:zhangtao43@localhost/AdminApp'
    })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Admin/api', noauthAPI);
app.use('/Admin/api/auth', authAPI.basicAuth, authAPI);

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') !== 'development') {
} else app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

// production error handler
// no stacktraces leaked to user

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
    var errorLogfile = fs.createWriteStream('../var/log/error.log', {flags: 'a'})
    errorLogfile.write(new Date().toLocaleString() + ' : ' + err.message + '\n');
    errorLogfile.write(err.stack + '\n');
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

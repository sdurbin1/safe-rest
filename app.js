var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// mongoose
var mongoose = require('mongoose');
require('./models/AnalyticParams');
require('./models/Visualizations');
require('./models/Analytics');
require('./models/Sources');
require('./models/Fields');
require('./models/Charts');
require('./models/Dashboards');

mongoose.connect('mongodb://localhost/safe');

var routes = require('./routes/index');
var users = require('./routes/users');
var analytics = require('./routes/analytics');
var visualizations = require('./routes/visualizations');
var sources = require('./routes/sources');
var documents = require('./routes/documents');
var charts = require('./routes/charts');
var dashboards = require('./routes/dashboards');
var authentication = require('./routes/authentication');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/analytics', analytics);
app.use('/visualizations', visualizations);
app.use('/sources', sources);
app.use('/documents', documents);
app.use('/charts', charts);
app.use('/dashboards', dashboards);
app.use('/authentication', authentication);

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

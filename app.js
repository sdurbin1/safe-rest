var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');

// mongoose
var mongoose = require('mongoose');
require('./models/VisualizationTypes');
require('./models/Analytics');
require('./models/Sources');
require('./models/Visualizations');
require('./models/Dashboards');

mongoose.connect('mongodb://localhost/safe');

var routes = require('./routes/index');
var users = require('./routes/users');
var analytics = require('./routes/analytics');
var visualizationTypes = require('./routes/visualization-types');
var sources = require('./routes/sources');
var visualizations = require('./routes/visualizations');
var execute = require('./routes/execute');
var dashboards = require('./routes/dashboards');
var authentication = require('./routes/authentication');
var query = require('./routes/query');
var upload = require('./routes/upload');

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
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/analytics', analytics);
app.use('/visualization-types', visualizationTypes);
app.use('/sources', sources);
app.use('/visualizations', visualizations);
app.use('/dashboards', dashboards);
app.use('/authenticate', authentication);
app.use('/sources', query);
app.use('/sources', upload);
app.use('/execute', execute);

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

if(config.mongoenabled == true) {
  
  var MongoClient = require('mongodb').MongoClient;
  
  MongoClient.connect(config.mongourl, function(err, db) {
    if(err != "null"){
      app.set('db', db);
    } else {
      console.log("Error connecting to mongo: " + err);
    }
  });
  
}

function exitHandler(options, err) {
  if(app.get('db')) {
    app.get('db').close();
  }
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

module.exports = app;
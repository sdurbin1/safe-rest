const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const config = require('./config')

// mongoose
const mongoose = require('mongoose')

require('./models/VisualizationTypes')
require('./models/Analytics')
require('./models/Sources')
require('./models/Visualizations')
require('./models/Dashboards')

mongoose.connect('mongodb://localhost/safe')

const routes = require('./routes/index')
const users = require('./routes/users')
const analytics = require('./routes/analytics')
const visualizationTypes = require('./routes/visualization-types')
const sources = require('./routes/sources')
const visualizations = require('./routes/visualizations')
const execute = require('./routes/execute')
const dashboards = require('./routes/dashboards')
const authentication = require('./routes/authentication')
const query = require('./routes/query')
const upload = require('./routes/upload')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  next()
})

app.use('/', routes)
app.use('/users', users)
app.use('/analytics', analytics)
app.use('/visualization-types', visualizationTypes)
app.use('/sources', sources)
app.use('/visualizations', visualizations)
app.use('/dashboards', dashboards)
app.use('/authenticate', authentication)
app.use('/sources', query)
app.use('/sources', upload)
app.use('/execute', execute)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

if (config.mongoenabled === true) {
  const MongoClient = require('mongodb').MongoClient
  
  MongoClient.connect(config.mongourl, function (err, db) {
    if (err !== 'null') {
      app.set('db', db)
    } else {
      console.log('Error connecting to mongo: ' + err)
    }
  })
}

function exitHandler (options, err) {
  if (app.get('db')) {
    app.get('db').close()
  }
  if (options.cleanup) console.log('clean')
  if (err) console.log(err.stack)
  if (options.exit) process.exit()
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}))

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}))

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}))

module.exports = app
  
'use strict'
const express = require('express')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fs = require('fs')
const http = require('http')
const https = require('https')
const connectMongo = require('connect-mongo')
const mongoose = require('mongoose')
const config = require('./config')
const compression = require('compression')

require('./models/VisualizationTypes')
require('./models/Analytics')
require('./models/Sources')
require('./models/Visualizations')
require('./models/Dashboards')
require('./extensions')

let mongourl

if (require.main === module) {
  mongourl = config.mongourl
} else {
  // for unit testing
  mongourl = config.mongourltest
}

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
const cloud = require('./routes/cloud')
const cloudExecute = require('./routes/cloudExecute')
const metrics = require('./routes/metrics')
const app = express()
let server = null
const serveroptions = {
  key: fs.readFileSync(config.serverkey),
  cert: fs.readFileSync(config.servercertificate),
  ca: fs.readFileSync(config.servercertificateauthority),
  requestCert: true,
  rejectUnauthorized: true,
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-SHA256:AES128-GCM-SHA256:RC4:HIGH:!MD5:!aNULL:!EDH'
}

if (config.environment === 'production') {
  server = https.createServer(serveroptions, app)
} else {
  server = http.createServer(app)
}

app.use(compression())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('port', process.env.PORT || config.portNumber)

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(mongourl)

const MongoStore = connectMongo(session)
const mongoOptions = {
  url: mongourl,
  pool: true
}

app.use(session({
  cookie: {
    maxAge: 60 * 60 * 12 * 1000
  },
  resave: false,
  saveUninitialized: true,
  secret: config.sessionsecret,
  store: new MongoStore(mongoOptions)
}))

app.use(function (req, res, next) {
  if (config.hosts.indexOf(req.get('origin')) !== -1) {
    res.header('Access-Control-Allow-Origin', req.get('origin'))
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
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
app.use('/cloud', cloud)
app.use('/cloudExecute', cloudExecute)
app.use('/metrics', metrics)

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

  MongoClient.connect(mongourl, function (err, db) {
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

const start = function () {
  server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'))
  })
}

const stop = function () {
  server.close()
}

if (require.main === module) {
  start()
} else {
  // for unit testing
  console.info('Running app as a module')
  module.exports = start
  module.exports = stop
}

module.exports = app

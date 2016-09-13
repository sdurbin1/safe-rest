'use strict'
const express = require('express')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const http = require('http')
const https = require('https')
const connectMongo = require('connect-mongo')
const mongoose = require('mongoose')
const config = require('./config')
const compression = require('compression')

let mongourl

if (require.main === module) {
  mongourl = config.mongourl
} else {
  // for unit testing
  mongourl = config.mongourltest
}

mongoose.connect(mongourl)

require('./models/VisualizationTypes')
require('./models/Alerts')
require('./models/Analytics')
require('./models/Sources')
require('./models/Visualizations')
require('./models/Dashboards')
require('./models/DashboardGroups')
require('./extensions')

const routes = require('./routes/index')
const users = require('./routes/users')
const alerts = require('./routes/alerts')
const analytics = require('./routes/analytics')
const visualizationTypes = require('./routes/visualization-types')
const sources = require('./routes/sources')
const visualizations = require('./routes/visualizations')
const execute = require('./routes/execute')
const dashboards = require('./routes/dashboards')
const dashboardGroups = require('./routes/dashboard-groups')
const authentication = require('./routes/authentication')
const authUtils = require('./utils/authentication')
const query = require('./routes/query')
const upload = require('./routes/upload')
const cloud = require('./routes/cloud')
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

if (config.sslmode === true) {
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

const MongoStore = connectMongo(session)
const mongoOptions = {
  mongooseConnection: mongoose.connection,
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

// authenticate all requests
app.use(function (req, res, next) {
  if ((req.path === '/api/authenticate') || (process.env.NODE_ENV === 'test')) {
    next()
  } else {
    authUtils.authenticate(req, res)
      .then((user) => next())
      .catch((error) => res.status(503).send(error))
  }
})

app.use('/api', routes)
app.use('/api/users', users)
app.use('/api/analytics', analytics)
app.use('/api/visualization-types', visualizationTypes)
app.use('/api/sources', sources)
app.use('/api/visualizations', visualizations)
app.use('/api/dashboards', dashboards)
app.use('/api/dashboard-groups', dashboardGroups)
app.use('/api/authenticate', authentication)
app.use('/api/sources', query)
app.use('/api/sources', upload)
app.use('/api/execute', execute)
app.use('/api/cloud', cloud)
app.use('/api/metrics', metrics)
app.use('/api/alerts', alerts)
app.use(express.static(path.join(__dirname, 'public/dist')))
app.use(express.static(path.join(__dirname, 'public/fonts')))
app.use(express.static(path.join(__dirname, 'public/node_modules')))

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/src/html/index.html'))
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')

  err.status = 404
  next(err)
})

// error handlers
// UI will render the error
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.send(err)
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

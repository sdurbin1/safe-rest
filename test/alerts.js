const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Alerts')
const Alert = mongoose.model('Alert')
const server = require('../app')
let cannedAlert

process.env.NODE_ENV = 'test'

describe('CRUD for alerts', function () {
  beforeEach(function (done) {
    Alert.create({'text': 'alert!'}, function (err, alert) {
      if (err) { throw err }
      
      cannedAlert = alert
      
      done()
    })
  })
  
  afterEach(function (done) {
    Alert.remove({}, function (err) {
      if (err) { throw err }
      
      cannedAlert = undefined
      
      done()
    })
  })
  
  it('GET /api/alerts', function testGetAlerts (done) {
    request(server)
      .get('/api/alerts')
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAlert._id.toString(),
        'text': 'alert!',
        '__v': 0
      }, done)
  })
  
  it('POST /api/alerts', function testPostAlerts (done) {
    request(server)
      .post('/api/alerts')
      .send({
        '_id': cannedAlert._id.toString(),
        'text': 'alert2!',
        '__v': 0
      })
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'text': 'alert2!',
        '__v': 0,
        '_id': 1
      }, done)
  })
})
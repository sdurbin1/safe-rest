const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Alerts')
const Alert = mongoose.model('Alert')
const server = require('../app')
let cannedAlert

process.env.NODE_ENV = 'test'

describe('CRUD for alerts', () => {
  beforeEach((done) => {
    Alert
      .create({'text': 'alert!'})
      .then(alert => {
        cannedAlert = alert
      
        done()
      })
      .catch(err => { throw err })
  })
  
  afterEach((done) => {
    Alert.remove({})
      .then(() => {
        cannedAlert = undefined
      
        done()
      })
      .catch(err => { throw err })
  })
  
  it('GET /api/alerts', done => {
    request(server)
      .get('/api/alerts')
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedAlert._id.toString(),
        'text': 'alert!',
        '__v': 0
      }], done)
  })
  
  it('POST /api/alerts', done => {
    request(server)
      .post('/api/alerts')
      .send({
        '_id': cannedAlert._id.toString(),
        'text': 'alert2!',
        '__v': 0
      })
      .expect(res => {
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
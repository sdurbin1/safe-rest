const request = require('supertest')
const mongoose = require('mongoose')

require('../models/VisualizationTypes')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedVisualizationType

process.env.NODE_ENV = 'test'

describe('CRUD for visualizationTypes', function () {
  beforeEach(function (done) {
    VisualizationType.create({'name': 'chart', 'queryLimit': 5}, function (err, visualizationType) {
      if (err) { throw err }
      cannedVisualizationType = visualizationType
      
      server.start
      
      done()
    })
  })
  
  afterEach(function (done) {
    VisualizationType.remove({}, function (err) {
      if (err) { throw err }

      server.stop
      
      done()
    })
  })
  
  it('POST /api/visualization-types', function testPostVisualizationTypes (done) {
    request(server)
      .post('/api/visualization-types')
      .send({'name': 'chart1', 'queryLimit': 3})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'chart1',
        'queryLimit': 3,
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /api/visualization-types', function testGetVisualizationTypes (done) {
    request(server)
      .get('/api/visualization-types')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart',
        'queryLimit': 5,
        '__v': 0
      }], done)
  })
  
  it('GET /api/visualizaiton-types/:visualization-type', function testGetVisualizationType (done) {
    request(server)
      .get('/api/visualization-types/' + cannedVisualizationType._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart',
        'queryLimit': 5,
        '__v': 0
      }, done)
  })
  
  it('PUT /api/visualization-types/:visualization-type', function testPutVisualizationType (done) {
    request(server)
      .put('/api/visualization-types/' + cannedVisualizationType._id)
      .send({'name': 'chart1'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart1',
        'queryLimit': 5,
        '__v': 0
      }, done)
  })
  
  it('DELETE /api/visualization-types/:visualization-type', function testDeleteVisualizationType (done) {
    request(server)
      .delete('/api/visualization-types/' + cannedVisualizationType._id)
      .expect(200, {}, done)
  })
})

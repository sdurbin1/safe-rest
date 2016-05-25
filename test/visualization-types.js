const request = require('supertest')
const mongoose = require('mongoose')

require('../models/VisualizationTypes')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedVisualizationType

describe('CRUD for visualizationTypes', function () {
  beforeEach(function (done) {
    VisualizationType.create({'name': 'chart'}, function (err, visualizationType) {
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
  
  it('POST /visualization-types', function testPostVisualizationTypes (done) {
    request(server)
      .post('/visualization-types')
      .send({'name': 'chart1'})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'chart1',
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /visualization-types', function testGetVisualizationTypes (done) {
    request(server)
      .get('/visualization-types')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart',
        '__v': 0
      }], done)
  })
  
  it('GET /visualizaiton-types/:visualization-type', function testGetVisualizationType (done) {
    request(server)
      .get('/visualization-types/' + cannedVisualizationType._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart',
        '__v': 0
      }, done)
  })
  
  it('PUT /visualization-types/:visualization-type', function testPutVisualizationType (done) {
    request(server)
      .put('/visualization-types/' + cannedVisualizationType._id)
      .send({'name': 'chart1'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualizationType._id.toString(),
        'name': 'chart1',
        '__v': 0
      }, done)
  })
  
  it('DELETE /visualization-types/:visualization-type', function testDeleteVisualizationType (done) {
    request(server)
      .delete('/visualization-types/' + cannedVisualizationType._id)
      .expect(200, {}, done)
  })
})

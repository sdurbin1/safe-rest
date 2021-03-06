const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Analytics')
require('../models/VisualizationTypes')
const Analytic = mongoose.model('Analytic')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedAnalytic
let cannedVisualizationType

process.env.NODE_ENV = 'test'

describe('CRUD for analytics', function () {
  beforeEach(function (done) {
    Analytic.create({'name': 'analytic'}, function (err, analytic) {
      if (err) { throw err }
      cannedAnalytic = analytic
      
      VisualizationType.create({'name': 'chart'}, function (err, visualizationType) {
        if (err) { throw err }
        
        server.start
        cannedVisualizationType = visualizationType
      
        done()
      })
    })
  })
  
  afterEach(function (done) {
    Analytic.remove({}, function (err) {
      if (err) { throw err }
      
      VisualizationType.remove({}, function (err) {
        if (err) { throw err }
        server.stop
      
        done()
      })
    })
  })
  
  it('POST /api/analytics', function testPostAnalytics (done) {
    request(server)
      .post('/api/analytics')
      .send({'name': 'analytic1'})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'analytic1',
        'visualizationTypes': [],
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /api/analytics', function testGetAnalytics (done) {
    request(server)
      .get('/api/analytics')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic',
        'visualizationTypes': [],
        '__v': 0
      }], done)
  })
  
  it('GET /api/analytics/:analytic', function testGetAnalytic (done) {
    request(server)
      .get('/api/analytics/' + cannedAnalytic._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic',
        'visualizationTypes': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /api/analytics/:analytic', function testPutAnalytic (done) {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id)
      .send({'name': 'analytic2'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic2',
        '__v': 0,
        'visualizationTypes': []
      }, done)
  })
  
  it('DELETE /api/analytics/:analytic', function testDeleteAnalytic (done) {
    request(server)
      .delete('/api/analytics/' + cannedAnalytic._id)
      .expect(200, {}, done)
  })
 
  it('PUT /api/analytics/:analytic/visualization-types', function testPutVisualizationType (done) {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualizationType._id.toString(),
        '__v': 0,
        'name': 'chart'
      }], done)
  })
  
  it('GET /api/analytics/:analytic/visualization-types', function testGetVisualizationType (done) {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(function () {
        request(server)
          .get('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
          .expect(function (res) {
            res.body[0].__v = 0
          })
          .expect(200, [{
            '_id': cannedVisualizationType._id.toString(),
            '__v': 0,
            'name': 'chart'
          }], done)
      })
  })
  
  it('DELETE /api/analytics/:analytic/visualization-types/:visualizationType', function testDeleteVisualizationType (done) {
    // First add visualization-type to analytic so we can test deleting it
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(function () {
        // Test delete
        request(server)
          .delete('/api/analytics/' + cannedAnalytic._id + '/visualization-types/' + cannedVisualizationType._id)
          .expect(200, [], done)
      })
  })
})

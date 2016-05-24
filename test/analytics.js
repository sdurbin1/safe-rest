const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Analytics')
require('../models/VisualizationTypes')
const Analytic = mongoose.model('Analytic')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedAnalytic
let cannedVisualizationType

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
  
  it('POST /analytics', function testCreate (done) {
    request(server)
      .post('/analytics')
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
  
  it('GET /analytics', function testGetAnalytics (done) {
    request(server)
      .get('/analytics')
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
  
  it('GET /analytics/:analytic', function testGetAnalytic (done) {
    request(server)
      .get('/analytics/' + cannedAnalytic._id)
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
  
  it('PUT /analytics/:analytic', function testPutAnalytic (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
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
  
  it('DELETE /analytics/:analytic', function testDeleteAnalytic (done) {
    request(server)
      .delete('/analytics/' + cannedAnalytic._id)
      .expect(200, {}, done)
  })
 
  it('PUT /analytics/:analytic/visualization-types', function testPutVisualizationType (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id + '/visualization-types')
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
  
  it('GET /analytics/:analytic/visualization-types', function testGetVisualizationType (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(function () {
        request(server)
          .get('/analytics/' + cannedAnalytic._id + '/visualization-types')
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
  
  it('DELETE /analytics/:analytic/visualization-types/:visualizationType', function testDeleteVisualizationType (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(function () {
        request(server)
          .delete('/analytics/' + cannedAnalytic._id + '/visualization-types/' + cannedVisualizationType._id)
          .expect(200, [], done)
      })
  })
})

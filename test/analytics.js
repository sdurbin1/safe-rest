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

describe('CRUD for analytics', () => {
  beforeEach(done => {
    Analytic
      .create({'name': 'analytic'})
      .then(analytic => {
        cannedAnalytic = analytic
      
        return VisualizationType.create({'name': 'chart'})
      })
      .then(visualizationType => {
        server.start
        cannedVisualizationType = visualizationType
      
        done()
      })
      .catch(err => { throw err })
  })
  
  afterEach(done => {
    Analytic
      .remove()
      .then(() => VisualizationType.remove({}))
      .then(() => {
        server.stop
      
        done()
      })
      .catch(err => { throw err })
  })
  
  it('POST /api/analytics', done => {
    request(server)
      .post('/api/analytics')
      .send({'name': 'analytic1'})
      .expect(res => {
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
  
  it('GET /api/analytics', done => {
    request(server)
      .get('/api/analytics')
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic',
        'visualizationTypes': [],
        '__v': 0
      }], done)
  })
  
  it('GET /api/analytics/:analytic', done => {
    request(server)
      .get('/api/analytics/' + cannedAnalytic._id)
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic',
        'visualizationTypes': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /api/analytics/:analytic', done => {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id)
      .send({'name': 'analytic2'})
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAnalytic._id.toString(),
        'name': 'analytic2',
        '__v': 0,
        'visualizationTypes': []
      }, done)
  })
  
  it('DELETE /api/analytics/:analytic', done => {
    request(server)
      .delete('/api/analytics/' + cannedAnalytic._id)
      .expect(200, {}, done)
  })
 
  it('PUT /api/analytics/:analytic/visualization-types', done => {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedAnalytic._id.toString(),
        '__v': 0,
        'name': 'analytic',
        'visualizationTypes': [{
          _id: cannedVisualizationType._id.toString(),
          name: 'chart',
          __v: 0
        }]
      }, done)
  })
  
  it('GET /api/analytics/:analytic/visualization-types', done => {
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(() => {
        request(server)
          .get('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
          .expect(res => {
            res.body[0].__v = 0
          })
          .expect(200, [{
            '_id': cannedVisualizationType._id.toString(),
            '__v': 0,
            'name': 'chart'
          }], done)
      })
  })
  
  it('DELETE /api/analytics/:analytic/visualization-types/:visualizationType', done => {
    // First add visualization-type to analytic so we can test deleting it
    request(server)
      .put('/api/analytics/' + cannedAnalytic._id + '/visualization-types')
      .send({'visualizationTypes': [cannedVisualizationType._id]})
      .end(() => {
        // Test delete
        request(server)
          .delete('/api/analytics/' + cannedAnalytic._id + '/visualization-types/' + cannedVisualizationType._id)
          .expect(200, [], done)
      })
  })
})

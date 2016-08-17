const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Sources')
require('../models/Analytics')
const Source = mongoose.model('Source')
const Analytic = mongoose.model('Analytic')
const server = require('../app')
let cannedSource
let cannedAnalytic

process.env.NODE_ENV = 'test'

describe('CRUD for sources', function () {
  beforeEach(function (done) {
    const sourceJson = {'name': 'source', 'type': 'mongo'}

    Source.create(sourceJson, function (err, source) {
      if (err) { throw err }
      cannedSource = source
      
      Analytic.create({'name': 'analytic'}, function (err, analytic) {
        if (err) { throw err }
        cannedAnalytic = analytic
        
        server.start
      
        done()
      })
    })
  })
  
  afterEach(function (done) {
    Source.remove({}, function (err) {
      if (err) { throw err }
      
      Analytic.remove({}, function (err) {
        if (err) { throw err }
        server.stop
      
        done()
      })
    })
  })
  
  it('POST /sources', function testPostSources (done) {
    request(server)
      .post('/sources')
      .send({'name': 'source1', 'type': 'mongo', 'metadata': {'test': 'test'}})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'source1',
        'type': 'mongo',
        'metadata': {'test': 'test'},
        'analytics': [],
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /sources', function testGetSources (done) {
    request(server)
      .get('/sources')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedSource._id.toString(),
        'name': 'source',
        '__v': 0
      }], done)
  })
  
  it('GET /sources/:source', function testGetSource (done) {
    request(server)
      .get('/sources/' + cannedSource._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedSource._id.toString(),
        'name': 'source',
        'type': 'mongo',
        'analytics': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /sources/:source', function testPutSource (done) {
    request(server)
      .put('/sources/' + cannedSource._id)
      .send({'name': 'source1'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedSource._id.toString(),
        'name': 'source1',
        'type': 'mongo',
        'analytics': [],
        '__v': 0
      }, done)
  })
  
  it('DELETE /sources/:source', function testDeleteSource (done) {
    request(server)
      .delete('/sources/' + cannedSource._id)
      .expect(200, {}, done)
  })
 
  it('PUT /sources/:source/analytics', function testPutAnalytics (done) {
    request(server)
      .put('/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .expect(function (res) {
        res.body.__v = 0
        res.body.analytics[0].__v = 0
      })
      .expect(200, {
        '_id': cannedSource._id.toString(),
        '__v': 0,
        'name': 'source',
        'type': 'mongo',
        'analytics': [{
          '_id': cannedAnalytic._id.toString(),
          'name': 'analytic',
          '__v': 0,
          'visualizationTypes': []
        }]
      }, done)
  })
  
  it('GET /sources/:source/analytics', function testGetAnalytics (done) {
    request(server)
      .put('/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .end(function () {
        request(server)
          .get('/sources/' + cannedSource._id + '/analytics')
          .expect(function (res) {
            res.body[0].__v = 0
          })
          .expect(200, [{
            '_id': cannedAnalytic._id.toString(),
            'name': 'analytic',
            '__v': 0,
            'visualizationTypes': []
          }], done)
      })
  })
  
  it('DELETE /sources/:source/analytics/:analytic', function testDeleteAnalytic (done) {
    // First add analytic to source so we can test deleting it
    request(server)
      .put('/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .end(function () {
        // Test delete
        request(server)
          .delete('/sources/' + cannedSource._id + '/analytics/' + cannedAnalytic._id)
          .expect(function (res) {
            res.body.__v = 0
          })
          .expect(200, {
            '_id': cannedSource._id.toString(),
            'name': 'source',
            'type': 'mongo',
            '__v': 0,
            'analytics': []
          }, done)
      })
  })
  
  it('GET /sources/:source/fields', function testGetFields (done) {
    // First add fields to source so we can test getting it
    request(server)
      .put('/sources/' + cannedSource._id)
      .send({'fields': [{'test': 'test'}]})
      .end(function () {
        // Test delete
        request(server)
          .get('/sources/' + cannedSource._id + '/fields')
          .expect(200, [{
            'test': 'test'
          }], done)
      })
  })
})

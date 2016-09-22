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

describe('CRUD for sources', () => {
  beforeEach(done => {
    Source
      .create({'name': 'source', 'type': 'mongo'})
      .then(source => {
        cannedSource = source
      
        return Analytic.create({'name': 'analytic'})
      })
      .then(analytic => {
        cannedAnalytic = analytic
        
        server.start
      
        done()
      })
      .catch(err => { throw err })
  })
  
  afterEach(done => {
    Source
      .remove({})
      .then(() => Analytic.remove({}))
      .then(() => {
        server.stop
      
        done()
      })
      .catch(err => { throw err })
  })
  
  it('POST /api/sources', done => {
    request(server)
      .post('/api/sources')
      .send({'name': 'source1', 'type': 'mongo', 'metadata': {'test': 'test'}})
      .expect(res => {
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
  
  it('GET /api/sources', done => {
    request(server)
      .get('/api/sources')
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedSource._id.toString(),
        'name': 'source',
        '__v': 0
      }], done)
  })
  
  it('GET /api/sources/:source', done => {
    request(server)
      .get('/api/sources/' + cannedSource._id)
      .expect(res => {
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
  
  it('PUT /api/sources/:source', done => {
    request(server)
      .put('/api/sources/' + cannedSource._id)
      .send({'name': 'source1'})
      .expect(res => {
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
  
  it('DELETE /api/sources/:source', done => {
    request(server)
      .delete('/api/sources/' + cannedSource._id)
      .expect(200, {}, done)
  })
 
  it('PUT /api/sources/:source/analytics', done => {
    request(server)
      .put('/api/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .expect(res => {
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
  
  it('GET /api/sources/:source/analytics', done => {
    request(server)
      .put('/api/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .end(() => {
        request(server)
          .get('/api/sources/' + cannedSource._id + '/analytics')
          .expect(res => {
            console.log(res.body)
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
  
  it('DELETE /api/sources/:source/analytics/:analytic', done => {
    // First add analytic to source so we can test deleting it
    request(server)
      .put('/api/sources/' + cannedSource._id + '/analytics')
      .send({'analytics': [cannedAnalytic._id]})
      .end(() => {
        // Test delete
        request(server)
          .delete('/api/sources/' + cannedSource._id + '/analytics/' + cannedAnalytic._id)
          .expect(res => {
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
  
  it('GET /api/sources/:source/fields', done => {
    // First add fields to source so we can test getting it
    request(server)
      .put('/api/sources/' + cannedSource._id)
      .send({'fields': [{'test': 'test'}]})
      .end(() => {
        // Test delete
        request(server)
          .get('/api/sources/' + cannedSource._id + '/fields')
          .expect(200, [{
            'test': 'test'
          }], done)
      })
  })
})

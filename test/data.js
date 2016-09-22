const request = require('supertest')
const mongoose = require('mongoose')
const mongoUtil = require('../utils/mongoUtil')

require('../models/Visualizations')
require('../models/Analytics')
require('../models/Sources')
require('../models/VisualizationTypes')
const Visualization = mongoose.model('Visualization')
const Analytic = mongoose.model('Analytic')
const Source = mongoose.model('Source')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedSource
const testData = [
  {'Age': 21, 'County': 'Anne Arundel'},
  {'Age': 33, 'County': 'Howard'},
  {'Age': 29, 'County': 'Anne Arundel'}
]

process.env.NODE_ENV = 'test'

describe('Test data', () => {
  beforeEach(done => {
    Source
      .create({'name': 'source'})
      .then((source) => {
        cannedSource = source

        done()
      })
      .catch(error => {
        console.log('Error: ' + error)
        done()
      })
  })

  afterEach(done => {
    mongoUtil.deleteDocument(server.get('db'), cannedSource._id.toString())
    .then(Source.remove({}))
    .then(Analytic.remove({}))
    .then(VisualizationType.remove({}))
    .then(Visualization.remove({}))
    .then(done())
    .catch(error => {
      console.log('Error: ' + error)
    })
  })

  it('POST /api/sources/:source/data', done => {
    request(server)
      .post('/api/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .expect(res => {
        res.body.__v = 0
        res.body._id = 1
        res.body.source.__v = 0
      })
      .expect(200, {
        '__v': 0,
        '_id': 1,
        'source': {
          '__v': 0,
          '_id': cannedSource._id.toString(),
          'analytics': [],
          'name': 'source'
        },
        'upload': {
          'success': true
        }
      }, done)
  })

  it('POST /api/sources/data', done => {
    let sourceId

    request(server)
      .post('/api/sources/data')
      .send({
        'document': testData,
        'source': {'name': 'source1'}
      })
      .expect(res => {
        sourceId = res.body.source._id
        res.body.__v = 0
        res.body._id = 1
        res.body.source.__v = 0
        res.body.source._id = 1
      })
      .expect(200, {
        '__v': 0,
        '_id': 1,
        'source': {
          '__v': 0,
          '_id': 1,
          'analytics': [],
          'name': 'source1'
        },
        'upload': {
          'success': true
        }
      }, () => {
        mongoUtil.deleteDocument(server.get('db'), sourceId)
        done()
      })
  })

  it('GET /api/sources/:source/hasData', done => {
    request(server)
      .post('/api/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(() => {
        request(server)
          .get('/api/sources/' + cannedSource._id + '/hasData')
          .expect(200, {
            'hasData': true
          }, done)
      })
  })

  it('GET /api/sources/:source/hasData', done => {
    request(server)
      .post('/api/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(() => {
        request(server)
          .get('/api/sources/' + cannedSource._id + '/hasData')
          .expect(200, {
            'hasData': true
          }, done)
      })
  })

  it('DELETE /api/sources/:source/data', done => {
    request(server)
      .post('/api/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(() => {
        request(server)
          .delete('/api/sources/' + cannedSource._id + '/data')
          .expect(200, {'success': true}, done)
      })
  })

  it('POST /api/sources/:source/query', done => {
    request(server)
      .post('/api/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(() => {
        request(server)
          .post('/api/sources/' + cannedSource._id + '/query')
          .expect(res => {
            res.body[0]._id = 1
            res.body[1]._id = 1
            res.body[2]._id = 1
          })
          .expect(200, [
            {'_id': 1, 'Age': 21, 'County': 'Anne Arundel'},
            {'_id': 1, 'Age': 33, 'County': 'Howard'},
            {'_id': 1, 'Age': 29, 'County': 'Anne Arundel'}
          ], done)
      })
  })
})
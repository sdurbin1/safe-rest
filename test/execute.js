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
let cannedVisualization
let cannedAnalytic
let cannedSource
let cannedVisualizationType
const testData = [
  {'Age': 21, 'County': 'Anne Arundel', 'Name': 'John'},
  {'Age': 33, 'County': 'Howard', 'Name': 'Jane'},
  {'Age': 29, 'County': 'Anne Arundel', 'Name': 'Jim'},
  {'Age': 35, 'County': 'Howard', 'Name': 'Sarah'}
]

describe('Test execute', function () {
  beforeEach(function (done) {
    createObject(Source, {'name': 'source'})
      .then((source) => {
        cannedSource = source
        
        createObject(Analytic, {'name': 'analytic'})
          .then((analytic) => {
            cannedAnalytic = analytic
            
            createObject(VisualizationType, {'name': 'chart'})
              .then((visualizationType) => {
                cannedVisualizationType = visualizationType
                
                createObject(Visualization, {
                  'name': 'visualization',
                  'source': cannedSource._id.toString(),
                  'analytic': cannedAnalytic._id.toString(),
                  'visualizationType': cannedVisualizationType._id.toString()
                })
                .then((visualization) => {
                  cannedVisualization = visualization
                  request(server)
                    .post('/sources/' + cannedSource._id + '/data')
                    .send({'document': testData})
                    .end(done)
                })
              })
          })
      })
      .catch(error => {
        console.log('Error: ' + error)
        done()
      })
  })
  
  afterEach(function (done) {
    mongoUtil.deleteDocument(server.get('db'), cannedSource._id.toString())
    .then(removeObject(Source))
    .then(removeObject(Analytic))
    .then(removeObject(VisualizationType))
    .then(removeObject(Visualization))
    .then(done())
    .catch(error => {
      console.log('Error: ' + error)
    })
  })
  
  it('POST /execute/:visualization for count', function testPostExecuteCount (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
      .send({'name': 'Count'})
      .end(function () {
        request(server)
          .put('/visualizations/' + cannedVisualization._id)
          .send({'analyticParams': {'county': '$County'}})
          .end(function () {
            request(server)
              .post('/execute/' + cannedVisualization._id)
              .expect(200, [
                {'Value': 'Howard', 'Count': 2},
                {'Value': 'Anne Arundel', 'Count': 2}
              ], done)
          })
      })
  })
  
  it('POST /execute/:visualization for average', function testPostExecuteAverage (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Average'})
        .end(function () {
          request(server)
            .put('/visualizations/' + cannedVisualization._id)
            .send({'analyticParams': {'groupBy': {'county': '$County'}, 'averageOn': '$Age'}})
            .end(function () {
              request(server)
                .post('/execute/' + cannedVisualization._id)
                .expect(200, [
                  {'Average': 34, 'Value': 'Howard'},
                  {'Average': 25, 'Value': 'Anne Arundel'}
                ], done)
            })
        })
  })
})
function createObject (model, json) {
  return new Promise(function (resolve, reject) {
    model.create(json, function (err, result) {
      if (err) { reject(err) }
      
      resolve(result)
    })
  })
}

function removeObject (model) {
  return new Promise(function (resolve, reject) {
    model.remove({}, function (err, result) {
      if (err) { reject(err) }
      
      resolve(result)
    })
  })
}
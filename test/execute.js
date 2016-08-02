const request = require('supertest')
const mongoose = require('mongoose')
const mongoUtil = require('../utils/mongoUtil')
const Promise = require('bluebird')

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
  {'Age': 21, 'County': 'Anne Arundel', 'Name': 'Jane', 'Gender': 'F', 'Latitude': '38.97', 'Longitude': '-76.68', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
  {'Age': 33, 'County': 'Howard', 'Name': 'John', 'Gender': 'M', 'Latitude': '39.18', 'Longitude': '-76.94', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
  {'Age': 29, 'County': 'Anne Arundel', 'Name': 'Joe', 'Gender': 'M', 'Latitude': '38.92', 'Longitude': '-76.65', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
  {'Age': 35, 'County': 'Howard', 'Name': 'Sarah', 'Gender': 'F', 'Latitude': '39.23', 'Longitude': '-76.82', 'toLatitude': '38.44', 'toLongitude': '-76.77'}
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

  it('POST /execute/:visualization for detailed count', function testPostExecuteDetailedCount (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Detailed Count'})
        .end(function () {
          request(server)
            .put('/visualizations/' + cannedVisualization._id)
            .send({'analyticParams': {
              'groupBy': {'County': '$County', 'Gender': '$Gender'},
              'topLevel': '$_id.groupBy.County',
              'lowerLevel': '$_id.groupBy.Gender',
              'series': 'gender'
            }})
            .end(function () {
              request(server)
                .post('/execute/' + cannedVisualization._id)
                .expect(200, [{
                  'Value': 'Anne Arundel',
                  'Details': [{'Count': 1, 'Value': 'M'}, {'Count': 1, 'Value': 'F'}],
                  'Count': 2},
                  {'Value': 'Howard',
                  'Details': [{'Count': 1, 'Value': 'F'}, {'Count': 1, 'Value': 'M'}],
                  'Count': 2
                }], done)
            })
        })
  })

  it('POST /execute/:visualization for simple map', function testPostExecuteMap (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Search'})
        .end(function () {
          request(server)
            .put('/visualization-types/' + cannedVisualizationType._id)
            .send({'name': 'Map'})
            .end(function () {
              request(server)
                .put('/visualizations/' + cannedVisualization._id)
                .send({'visualizationParams': {'latField': 'Latitude', 'longField': 'Longitude', 'label': ['County']}, 'analyticParams': {'label': 'County'}})
                .end(function () {
                  request(server)
                    .post('/execute/' + cannedVisualization._id)
                    .expect(200, [
                      {'County': 'Anne Arundel', 'Latitude': '38.97', 'Longitude': '-76.68'},
                      {'County': 'Howard', 'Latitude': '39.18', 'Longitude': '-76.94'},
                      {'County': 'Anne Arundel', 'Latitude': '38.92', 'Longitude': '-76.65'},
                      {'County': 'Howard', 'Latitude': '39.23', 'Longitude': '-76.82'}
                    ], done)
                })
            })
        })
  })

  it('POST /execute/:visualization for simple map table view', function testPostExecuteMapTableView (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Search'})
        .end(function () {
          request(server)
            .put('/visualization-types/' + cannedVisualizationType._id)
            .send({'name': 'Table'})
            .end(function () {
              request(server)
                .post('/execute/' + cannedVisualization._id)
                .expect(function (res) {
                  res.body[0]._id = 1
                  res.body[1]._id = 1
                  res.body[2]._id = 1
                  res.body[3]._id = 1
                })
                .expect(200, [
                  {'Age': 21, 'County': 'Anne Arundel', 'Gender': 'F', 'Latitude': '38.97', 'Longitude': '-76.68', '_id': 1, 'Name': 'Jane', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
                  {'Age': 33, 'County': 'Howard', 'Gender': 'M', 'Latitude': '39.18', 'Longitude': '-76.94', '_id': 1, 'Name': 'John', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
                  {'Age': 29, 'County': 'Anne Arundel', 'Gender': 'M', 'Latitude': '38.92', 'Longitude': '-76.65', '_id': 1, 'Name': 'Joe', 'toLatitude': '38.44', 'toLongitude': '-76.77'},
                  {'Age': 35, 'County': 'Howard', 'Gender': 'F', 'Latitude': '39.23', 'Longitude': '-76.82', '_id': 1, 'Name': 'Sarah', 'toLatitude': '38.44', 'toLongitude': '-76.77'}
                ], done)
            })
        })
  })

  it('POST /execute/:visualization for layered map', function testPostExecuteLayeredMap (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Search'})
        .end(function () {
          request(server)
            .put('/visualization-types/' + cannedVisualizationType._id)
            .send({'name': 'Map'})
            .end(function () {
              request(server)
                .put('/visualizations/' + cannedVisualization._id)
                .send({
                  'visualizationParams': {'latField': 'Latitude', 'longField': 'Longitude', 'label': ['County', 'Name']},
                  'analyticParams': {
                    'type': 'multiQuery',
                    'outputTypeFilters': [
                      {'dataType': 'BASE', 'name': 'Females', 'filter': {'field': 'Gender', 'operator': '=', 'value': 'F'}},
                      {'dataType': 'LAYER', 'name': 'Howard County', 'filter': {'field': 'County', 'operator': '=', 'value': 'Howard'}}
                    ]}
                })
                .end(function () {
                  request(server)
                    .post('/execute/' + cannedVisualization._id)
                    .expect(200, {
                      'baseData': [
                        {'County': 'Anne Arundel', 'Latitude': '38.97', 'Longitude': '-76.68', 'Name': 'Jane'},
                        {'County': 'Howard', 'Latitude': '39.23', 'Longitude': '-76.82', 'Name': 'Sarah'}
                      ],
                      'layers': [{
                        'data': [
                          {'County': 'Howard', 'Latitude': '39.18', 'Longitude': '-76.94', 'Name': 'John'},
                          {'County': 'Howard', 'Latitude': '39.23', 'Longitude': '-76.82', 'Name': 'Sarah'}
                        ],
                        'name': 'Howard County'
                      }]}, done)
                })
            })
        })
  })

  it('POST /execute/:visualization for p2p map', function testPostExecuteP2PMap (done) {
    request(server)
      .put('/analytics/' + cannedAnalytic._id)
        .send({'name': 'Search'})
        .end(function () {
          request(server)
            .put('/visualization-types/' + cannedVisualizationType._id)
            .send({'name': 'Map'})
            .end(function () {
              request(server)
                .put('/visualizations/' + cannedVisualization._id)
                .send({
                  'visualizationParams': {'latField': 'Latitude', 'longField': 'Longitude', 'label': 'Label', 'sourcePrefix': 'from', 'destinationPrefix': 'to'},
                  'analyticParams': {
                    'fromLatField': 'Latitude',
                    'fromLongField': 'Longitude',
                    'toLatField': 'toLatitude',
                    'toLongField': 'toLongitude',
                    'fromLabelField': 'County',
                    'toLabelField': 'County'
                  }
                })
                .end(function () {
                  request(server)
                    .post('/execute/' + cannedVisualization._id)
                    .expect(200, [{
                      'fromLongitude': '-76.68',
                      'fromLatitude': '38.97',
                      'toLongitude': '-76.77',
                      'toLatitude': '38.44',
                      'fromLabel': 'Anne Arundel',
                      'toLabel': 'Anne Arundel'},
                      {'fromLongitude': '-76.94',
                      'fromLatitude': '39.18',
                      'toLongitude': '-76.77',
                      'toLatitude': '38.44',
                      'fromLabel': 'Howard',
                      'toLabel': 'Howard'},
                      {'fromLongitude': '-76.65',
                      'fromLatitude': '38.92',
                      'toLongitude': '-76.77',
                      'toLatitude': '38.44',
                      'fromLabel': 'Anne Arundel',
                      'toLabel': 'Anne Arundel'},
                      {'fromLongitude': '-76.82',
                      'fromLatitude': '39.23',
                      'toLongitude': '-76.77',
                      'toLatitude': '38.44',
                      'fromLabel': 'Howard',
                      'toLabel': 'Howard'
                    }], done)
                })
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
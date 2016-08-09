'use strict'
exports.transformMap = transformMap
exports.transformLayeredMap = transformLayeredMap
exports.transformP2PMap = transformP2PMap
exports.transformBasic = transformBasic
exports.transformBasicCount = transformBasicCount
exports.transformDetailed = transformDetailed
exports.transformSummaryCount = transformSummaryCount
// exports.transformBasicAverage = transformBasicAverage()

function transformMap (visualization, raw) {
  const output = []
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}

    if (raw[i][visualization.visualizationParams.longField] != null) {
      record[visualization.visualizationParams.longField] = raw[i][visualization.visualizationParams.longField]
    }
    if (raw[i][visualization.visualizationParams.latField] != null) {
      record[visualization.visualizationParams.latField] = raw[i][visualization.visualizationParams.latField]
    }
    for (let l = 0; l < visualization.visualizationParams.label.length; l++) {
      if (raw[i][visualization.visualizationParams.label[l]] != null) {
        record[visualization.visualizationParams.label[l]] = raw[i][visualization.visualizationParams.label[l]]
      }
    }
    
    output.push(record)
  }
  
  return output
}
  
function transformP2PMap (visualization, raw) {
  const output = []
  const fromPrefix = visualization.visualizationParams.sourcePrefix
  const toPrefix = visualization.visualizationParams.destinationPrefix
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}

    if (raw[i][visualization.analyticParams.fromLongField] != null) {
      record[fromPrefix + 'Longitude'] = raw[i][visualization.analyticParams.fromLongField]
    }
    if (raw[i][visualization.analyticParams.fromLatField] != null) {
      record[fromPrefix + 'Latitude'] = raw[i][visualization.analyticParams.fromLatField]
    }
    
    if (raw[i][visualization.analyticParams.toLongField] != null) {
      record[toPrefix + 'Longitude'] = raw[i][visualization.analyticParams.toLongField]
    }
    if (raw[i][visualization.analyticParams.toLatField] != null) {
      record[toPrefix + 'Latitude'] = raw[i][visualization.analyticParams.toLatField]
    }
    
    if (raw[i][visualization.analyticParams.fromLabelField] != null) {
      record[fromPrefix + 'Label'] = raw[i][visualization.analyticParams.fromLabelField]
    }
    if (raw[i][visualization.analyticParams.toLabelField] != null) {
      record[toPrefix + 'Label'] = raw[i][visualization.analyticParams.toLabelField]
    }
   
    output.push(record)
  }
  
  return output
}

function transformLayeredMap (visualization, raw) {
  const outputObject = {}
  const layers = []

  for (let i = 0; i < raw.length; i = i + 1) {
    const results = raw[i].results
    const type = raw[i].type
    const name = raw[i].name
    const outputRecords = []
    const layerObj = {}
    
    for (let j = 0; j < results.length; j = j + 1) {
      const record = {}
  
      if (results[j][visualization.visualizationParams.longField] != null) {
        record[visualization.visualizationParams.longField] = results[j][visualization.visualizationParams.longField]
      }
      if (results[j][visualization.visualizationParams.latField] != null) {
        record[visualization.visualizationParams.latField] = results[j][visualization.visualizationParams.latField]
      }
      for (let l = 0; l < visualization.visualizationParams.label.length; l++) {
        if (results[j][visualization.visualizationParams.label[l]] != null) {
          record[visualization.visualizationParams.label[l]] = results[j][visualization.visualizationParams.label[l]]
        }
      }

      outputRecords.push(record)
    }
    if (type === 'BASE') {
      outputObject['baseData'] = outputRecords
    } else {
      layerObj['name'] = name
      layerObj['data'] = outputRecords
      layers.push(layerObj)
    }
  }
  outputObject['layers'] = layers
  
  return outputObject
}

function transformBasicCount (raw) {
  const output = []
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}
    
    for (const k in raw[i]['_id']) {
      record['Value'] = raw[i]['_id'][k]
    }
        
    record['Count'] = raw[i].count
    output.push(record)
  }
  
  return output
}

function transformBasic (raw) {
  const output = []
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}
    
    for (const k in raw[i]) {
      record[k] = raw[i][k]
    }
        
    output.push(record)
  }
  
  return output
}

function transformDetailed (raw) {
  const output = []
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}
    
    record['Value'] = raw[i]._id
    record['Details'] = raw[i].Details
    record['Count'] = raw[i].Count
    output.push(record)
  }
  
  return output
}

function transformSummaryCount (visualization, raw) {
  const output = []
  const summaryValues = visualization.analyticParams.summaryValues
  
  for (let i = 0; i < raw.length; i = i + 1) {
    for (const key in raw[i]) {
      if (summaryValues.indexOf(key) > -1) {
        output.push({[key]: raw[i][key]})
      }
    }
  }
  
  return output
}
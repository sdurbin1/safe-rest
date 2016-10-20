'use strict'

exports.transformBasicAverage = raw => (
  raw.map(rawItem => ({
    Average: rawItem.average,
    Value: extractId(rawItem)
  }))
)

exports.transformMap = (visualization, raw = []) => {
  const {visualizationParams} = visualization
  const {label = []} = visualizationParams
  const {latField, longField} = visualizationParams
  const labelArray = labelToArray(label)
  
  return raw.map(rawItem => (
    Object.assign({}, {
      [latField]: rawItem[latField],
      [longField]: rawItem[longField]
    }, labelArray.reduce((results, labelName) => (
      Object.assign(
        results,
        {[labelName]: rawItem[labelName]}
      )
    ), {}))
  ))
}
  
exports.transformP2PMap = (visualization, raw = []) => {
  const {analyticParams, visualizationParams} = visualization
  const {
    fromLabelField,
    fromLatField,
    fromLongField,
    toLabelField,
    toLatField,
    toLongField
  } = analyticParams
  const {destinationPrefix, sourcePrefix} = visualizationParams
  
  return raw.map(rawItem => ({
    [destinationPrefix + 'Label']: rawItem[toLabelField],
    [destinationPrefix + 'Latitude']: rawItem[toLatField],
    [destinationPrefix + 'Longitude']: rawItem[toLongField],
    [sourcePrefix + 'Label']: rawItem[fromLabelField],
    [sourcePrefix + 'Latitude']: rawItem[fromLatField],
    [sourcePrefix + 'Longitude']: rawItem[fromLongField]
  }))
}

exports.transformLayeredMap = (visualization, raw) => {
  const {visualizationParams} = visualization
  const {label, latField, longField} = visualizationParams
  let baseData
  const layers = []
  const labelArray = labelToArray(label)

  for (const rawItem of raw) {
    const {name, results, type} = rawItem
    
    const data = results.map(result => (
      Object.assign({
        [latField]: result[latField],
        [longField]: result[longField]
      }, labelArray.reduce((labelResults, labelName) => (
        Object.assign(
          labelResults,
          {[labelName]: result[labelName]}
      )), {}))
    ))
    
    if (type === 'BASE') {
      baseData = data
    } else {
      layers.push({
        data,
        name
      })
    }
  }
  
  return {
    baseData,
    layers
  }
}

exports.transformBasicCount = raw => (
  raw.map(rawItem => ({
    Count: rawItem.count,
    Value: extractId(rawItem)
  }))
)

exports.transformBasic = raw => (
  raw.map(rawItem => (
    Object.assign({}, rawItem)
  ))
)

exports.transformDetailed = raw => (
  raw.map(rawItem => ({
    Count: rawItem.Count,
    Details: rawItem.Details,
    Value: rawItem._id
  }))
)

exports.transformSummaryCount = (visualization, raw) => {
  const output = []
  const {analyticParams} = visualization
  const {summaryValues} = analyticParams
  
  for (const rawItem of raw) {
    for (const key in rawItem) {
      if (summaryValues.indexOf(key) > -1) {
        output.push({[key]: rawItem[key]})
      }
    }
  }
  
  return output
}

const extractId = item => item._id[Object.keys(item._id)[0]]

const labelToArray = label => Array.isArray(label) ? label : [label]
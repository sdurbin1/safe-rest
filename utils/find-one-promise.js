const Promise = require('bluebird')

module.exports = findOnePromise

function findOnePromise (collection, query) {
  return new Promise(function (resolve, reject) {
    collection.findOne(query, function (error, result) {
      if (error) {
        reject(error)
        
        return
      }
      
      resolve(result || false)
    })
  })
}

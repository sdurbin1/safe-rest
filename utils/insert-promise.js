const Promise = require('bluebird')

module.exports = insertPromise

function insertPromise (collection, query) {
  return new Promise(function (resolve, reject) {
    collection.insert(query, function (error, result) {
      if (error) {
        reject(error)

        return
      }

      resolve(result)
    })
  })
}

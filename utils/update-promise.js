const Promise = require('bluebird')

module.exports = updatePromise

function updatePromise (collection, query, modifierQuery) {
  return new Promise(function (resolve, reject) {
    collection.update(query, modifierQuery, function (error, result) {
      if (error) {
        reject(error)

        return
      }

      resolve(result || false)
    })
  })
}

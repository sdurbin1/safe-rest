const Promise = require('bluebird')

exports.authenticate = authenticate

function authenticate(req, res) {
  return new Promise(function (resolve, reject) {
    const result = {username: 'user', authenticated: true}
        
    resolve(result)
  })
}
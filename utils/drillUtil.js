const http = require('http')
const Promise = require('bluebird')

exports.queryDrill = queryDrill

const options = {
  host: 'localhost',
  port: 8081,
  path: '/query.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

function queryDrill (queryString) {
  return new Promise(function (resolve, reject) {
    const query = {
      'queryType': 'SQL',
      'query': queryString
    }
    let ret = ''
    const req = http.request(options, function (response) {
      response.setEncoding('utf8')
      response.on('data', function (chunk) {
        ret += chunk
      })
      response.on('end', function () {
        resolve(JSON.parse(ret))
      })
    })
    
    req.write(JSON.stringify(query))
        
    req.on('error', function (error) {
      reject(error)
    })
        
    req.end()
  })
}

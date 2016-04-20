var http = require('http');
var Promise = require('bluebird')

exports.queryDrill = queryDrill;

var options = {
    host: "localhost",
    port: 8081,
    path: '/query.json',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

function queryDrill(queryString) {
    return new Promise(function (fullfill, reject) {
        var query = {
            "queryType": "SQL",
            "query": queryString
        }
        var ret = ''
        
        var req = http.request(options, function (response) {
            response.setEncoding('utf8')
            response.on('data', function(chunk) {
                ret += chunk 
            })
            response.on('end', function() {
                fullfill(JSON.parse(ret))
            })
        })
        req.write(JSON.stringify(query))
        
        req.on('error', function(error) {
            reject(error)
        })
        
        req.end()
    })
}
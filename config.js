const mongoaddress = 'localhost'
const mongoport = '27017'
const mongoschema = 'safe'
const mongoschematest = 'safe_test'

exports.mongoaddress = mongoaddress
exports.mongoport = mongoport
exports.mongoschema = mongoschema

exports.mongourl = 'mongodb://' + mongoaddress + ':' + mongoport + '/' + mongoschema
exports.mongourltest = 'mongodb://' + mongoaddress + ':' + mongoport + '/' + mongoschematest

exports.mongoenabled = true

// EXPRESS WEB SERVER PORT (Node.js default port is 3000)
exports.portNumber = '8443'

// EXPRESS WEB SERVER SESSION
exports.sessionsecret = '348SESSIONSECRETTTTTTT1234'

// WEB SERVER CERTIFICATES
// Directory path to the server key
exports.serverkey = 'ssl/server.key'
// Directory path to the server certificate
exports.servercertificate = 'ssl/server.crt'
// Directory path to the server certificate authority
exports.servercertificateauthority = 'ssl/ca.crt'

// Environment
exports.environment = 'development'

exports.hosts = [
  'https://localhost'
]

var mongoaddress
var mongoport
var mongoschema

exports.mongoaddress = mongoaddress = 'localhost'
exports.mongoport = mongoport = '27017'
exports.mongoschema = mongoschema = 'safe'

exports.mongourl = 'mongodb://' + mongoaddress + ':' + mongoport + '/' + mongoschema

exports.mongoenabled = true
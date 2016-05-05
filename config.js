const mongoaddress = 'localhost'
const mongoport = '27017'
const mongoschema = 'safe'

exports.mongoaddress = mongoaddress
exports.mongoport = mongoport
exports.mongoschema = mongoschema

exports.mongourl = 'mongodb://' + mongoaddress + ':' + mongoport + '/' + mongoschema

exports.mongoenabled = true

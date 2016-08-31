const mongoose = require('mongoose')
const mongoExecute = require('../utils/mongoExecute')

const AlertSchema = new mongoose.Schema({
  text: String
})

mongoose.model('Alert', AlertSchema)

AlertSchema.methods.query = function query (requestBody, db, session) {
  return mongoExecute.mongoQuery(requestBody, db, this)
}

delete mongoose.connection.models['Alert']
mongoose.model('Alert', AlertSchema)

const mongoose = require('mongoose')
const mongoExecute = require('../utils/mongoExecute')

const SourceSchema = new mongoose.Schema({
  name: String,
  type: String,
  searchParams: mongoose.Schema.Types.Mixed,
  analytics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Analytic'}],
  fields: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
})

mongoose.model('Source', SourceSchema)

SourceSchema.methods.query = function query (requestBody, db, session) {
  return mongoExecute.mongoQuery(requestBody, db, this)
}

delete mongoose.connection.models['Source']
mongoose.model('Source', SourceSchema)

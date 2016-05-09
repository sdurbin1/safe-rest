const mongoose = require('mongoose')

const SourceSchema = new mongoose.Schema({
  name: String,
  type: String,
  analytics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Analytic'}],
  fields: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
})

mongoose.model('Source', SourceSchema)

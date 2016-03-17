var mongoose = require('mongoose');

var SourceSchema = new mongoose.Schema({
  name: String,
  analytics:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' }],
  fields: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Field' }]
});

mongoose.model('Source', SourceSchema);

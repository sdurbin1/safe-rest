var mongoose = require('mongoose');

var SourceSchema = new mongoose.Schema({
  name: String,
  analytics:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' }],
  fields: [ String ] //TODO: in future should this be separate object?
});

mongoose.model('Source', SourceSchema);

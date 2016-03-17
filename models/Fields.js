var mongoose = require('mongoose');

var FieldSchema = new mongoose.Schema({
  name: String,
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' }
});

mongoose.model('Field', FieldSchema);

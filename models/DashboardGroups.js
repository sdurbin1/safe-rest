const mongoose = require('mongoose')

const DashboardGroupSchema = new mongoose.Schema({
  title: String,
  dashboards: [{type: mongoose.Schema.Types.ObjectId, ref: 'Dashboard'}]
})

mongoose.model('DashboardGroup', DashboardGroupSchema)

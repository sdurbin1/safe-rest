const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')
const Alert = mongoose.model('Alert')

/* GET /alerts */
router.get('/', function (req, res, next) {
  Alert.findOne({}, '_id text', function (err, alert) {
    if (err) { return next(err) }
    
    if (alert === null) {
      alert = {}
    }

    res.json(alert)
  })
})

/* POST /alerts */
router.post('/', function (req, res, next) {
  Alert.findOneAndUpdate({'_id': req.body._id}, req.body, {new: true}).exec(function (err, alert) {
    if (err) { return next(err) }
    
    res.json(alert)
  })
})
const Promise = require('bluebird')
const findOnePromise = require('./find-one-promise')
const insertPromise = require('./insert-promise')
const updatePromise = require('./update-promise')

exports.authenticate = authenticate

function authenticate (req, res) {
  return new Promise(function (resolve, reject) {
    if (!req.client.authorized) {
      console.log('No user certificate')
      reject('A valid PKI certificate is required for access')
    }
    
    const subject = req.connection.getPeerCertificate().subject
    const certIssuer = req.connection.getPeerCertificate().issuer
    const issuer = formatCertIssuer(certIssuer)
    const uidPosition = subject.CN.lastIndexOf(' ')
    const username = subject.CN.substr(uidPosition + 1)
    
    req.session.username = username
    req.session.issuer = issuer
    
    verifyUser(req)
      .then((user) => saveUser(req, res, user))
      .then((savedUser) => resolve(savedUser))
      .catch((error) => reject(error))
  })
}

function formatCertIssuer (ci) {
  let str = ''
  
  str += 'C=' + ci.C + ', O=' + ci.O + ', CN=' + ci.CN

  return str
}

function createUser (req) {
  const db = req.app.get('db')
  const collection = db.collection('users')
  
  const query = {
    authenticated: true,
    authorized: 1,
    lastlogin: new Date(),
    issuer: req.session.issuer,
    username: req.session.username,
    admin: false
  }
  
  return insertPromise(collection, query)
}

function saveUser (req, res, user) {
  return new Promise(function (resolve, reject) {
    if (!user && !req.session.username) {
      reject('Invalid username in PKI')
    }
    
    if (user) {
      // The result from updateLoginDate does not contain user data that is needed by the UI. Resolved with user object instead
      req.session.userId = user._id
      updateLoginDate(req)
        .then(() => resolve(user))
        .catch((error) => reject(error))
        
      return
    }
    
    // create User does not return user data. Call verifyUser to get user data
    createUser(req)
      .then(() => verifyUser(req))
      .then((savedUser) => resolve(savedUser))
      .catch((error) => reject(error))
  })
}

function verifyUser (req) {
  const db = req.app.get('db')
  const collection = db.collection('users')
  const query = {username: req.session.username}
  
  return findOnePromise(collection, query)
}

function updateLoginDate (req) {
  const username = req.session.username
  const db = req.app.get('db')
  const collection = db.collection('users')
  const query = {username}
  const modifierQuery = {
    $set: {
      lastlogindate: new Date()
    }
  }
  
  return updatePromise(collection, query, modifierQuery)
}
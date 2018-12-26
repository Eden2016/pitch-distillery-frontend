var _ = require('lodash')

var port = process.env.PORT || 8080
var env = process.env.NODE_ENV || 'development'

var config = {}

config.all = {
  env: env,
  port: port
}

config.development = {
  baseUrl: 'http://localhost:8080',
  apiUrl: 'https://pitch-builder-test.azurewebsites.net',
  affinityApiUrl: 'http://localhost:3000'
}

config.test = {
  baseUrl: 'https://staging-pitch-distillery-frontend.azurewebsites.net',
  apiUrl: 'https://staging-pitch-distillery-backend.azurewebsites.net',
  affinityApiUrl: 'https://staging-pitch-distillery-backend.azurewebsites.net'
}

config.production = {
  baseUrl: 'https://pitch-builder-frontend.azurewebsites.net',
  apiUrl: 'https://pitch-builder.azurewebsites.net',
  affinityApiUrl: 'https://pitch-builder.azurewebsites.net'
}

module.exports = _.merge({}, config.all, config[env])

const mongoose = require('mongoose')
require('dotenv').config()

// No personal MongoDB driver link is committed. Each member provides their own
// via .env (see .env.example). This keeps the team's secret-scanning fix in
// this module, so seeddata.js (owned by the team) stays untouched.
const DEFAULT_URI = ''

async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI
  if (!uri) {
    console.error('Missing MONGODB_URI. Copy .env.example to .env and fill it in.')
    return
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    })
    console.log(`MongoDB connected (${mongoose.connection.name})`)
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    console.error('Sign-up / login will not work until MongoDB is reachable.')
  }
}

module.exports = { connectDB }

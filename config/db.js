const mongoose = require('mongoose')

// Default MongoDB connection string. Left empty on purpose — do NOT commit a
// personal/driver link. Set MONGODB_URI in your own .env instead.
const DEFAULT_URI = ''

async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI
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

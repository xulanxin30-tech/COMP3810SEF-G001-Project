const mongoose = require('mongoose')

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/comp3810sef_g001'

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

// Seed script: npm run seed
// Loads env, connects to MongoDB, inserts demo users and books.
require('dotenv').config()

const mongoose = require('mongoose')
const { User, Book } = require('./models/schema')

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/comp3810sef_g001'
const uri = process.env.MONGODB_URI || DEFAULT_URI

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB connected successfully')
    return runSeed()
  })
  .then(() => {
    console.log('Seed complete')
    return mongoose.disconnect()
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    console.error('Make sure MongoDB is running locally, or set MONGODB_URI in .env.')
    process.exit(1)
  })

async function runSeed() {
  const users = [
    { username: 's0000001', password: 'sz212345', name: 'Zhang San' },
    { username: 's1397832', password: 'Abc22222', name: 'Xiao Ming' },
    { username: 's3780234', password: 'Def33333', name: 'Xiao Qiao' }
  ]

  for (const u of users) {
    await User.findOneAndUpdate(
      { username: u.username },
      u,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(`user:${u.name} seeded`)
  }

  const books = [
    {
      title: 'Computer networks. 1',
      author: 'Kurose, James F. ; Ross, Keith W.',
      category: 'Computer Networks',
      publisher: 'Pearson Education Asia Limited',
      publishYear: 2022
    },
    {
      title: 'Computer networks. 2',
      author: 'Kurose, James F. ; Ross, Keith W.',
      category: 'Computer Networks',
      publisher: 'Pearson Education Asia Limited',
      publishYear: 2022
    },
    {
      title: 'Computer networks. 3',
      author: 'Kurose, James F. ; Ross, Keith W.',
      category: 'Computer Networks',
      publisher: 'Pearson Education Asia Limited',
      publishYear: 2022
    }
  ]

  for (const b of books) {
    await Book.findOneAndUpdate(
      { title: b.title },
      b,
      { upsert: true, new: true }
    )
    console.log(`book:${b.title} seeded`)
  }
}

//if you want to test, put package.json and seeddata.js from the views folder, schema.js from models folder into the same folder, and type npm run seed 
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+$/, 'wrong! Username can only contain lowercase letters and numbers']
  },
  password: {
    type: String,
    required: true,
    match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, 'Password must contain at least one letter and one number']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
});
const User = mongoose.model('User', userSchema);

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  category: String,
  publisher: String,
  publishYear: Number
});
const Book = mongoose.model('Book', bookSchema);







module.exports = { User, Book};

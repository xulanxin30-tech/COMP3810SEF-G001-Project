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

// Item is the document stored by the RESTful API (routes/api.js).
// curl -> Express router -> Mongoose model -> MongoDB collection `items`.
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Keep the original API contract: responses expose `id` (the MongoDB _id as a
// string) rather than `_id` / `__v`, so existing curl examples still make sense.
itemSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
const Item = mongoose.model('Item', itemSchema);

module.exports = { User, Book, Item };

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      }
    }
  }
)

// Virtual setter: assign a plain password, it gets hashed before saving
userSchema.virtual('password').set(function setPassword(password) {
  this._plainPassword = password
})

userSchema.pre('save', async function hashPassword() {
  if (this._plainPassword === undefined) return
  this.passwordHash = await bcrypt.hash(this._plainPassword, SALT_ROUNDS)
})

// Compare a candidate password against the stored hash
userSchema.methods.verifyPassword = function verifyPassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)

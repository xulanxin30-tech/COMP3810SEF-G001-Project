const express = require('express')
const User = require('../models/User')
const { requireGuest, wantsJson, getSessionUser } = require('../middleware/auth')

const router = express.Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Only allow same-site relative redirect targets
function safeNext(value) {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    return value
  }
  return '/'
}

// T08 - Sign-up page
router.get('/signup', requireGuest, (req, res) => {
  res.render('auth/signup', { errors: [], values: {} })
})

// T08 - Sign-up API
router.post('/signup', requireGuest, async (req, res, next) => {
  const name = (req.body.name || '').trim()
  const email = (req.body.email || '').trim().toLowerCase()
  const password = req.body.password || ''
  const nextUrl = safeNext(req.body.next)

  const errors = []
  if (name.length < 2 || name.length > 60) errors.push('Name must be between 2 and 60 characters.')
  if (!EMAIL_REGEX.test(email)) errors.push('Please enter a valid email address.')
  if (password.length < 8) errors.push('Password must be at least 8 characters.')

  if (errors.length > 0) {
    if (wantsJson(req)) return res.status(400).json({ errors })
    return res.status(400).render('auth/signup', { errors, values: { name, email } })
  }

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      const msg = 'This email is already registered.'
      if (wantsJson(req)) return res.status(409).json({ errors: [msg] })
      return res.status(409).render('auth/signup', { errors: [msg], values: { name, email } })
    }

    const user = new User({ name, email })
    user.password = password
    await user.save()

    // T10 - create the session right after sign-up
    req.session.user = user.toJSON()

    if (wantsJson(req)) return res.status(201).json({ user: req.session.user })
    return res.redirect(nextUrl)
  } catch (err) {
    return next(err)
  }
})

// T09 - Login page
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', { errors: [], values: {}, next: safeNext(req.query.next) })
})

// T09 - Login API
router.post('/login', requireGuest, async (req, res, next) => {
  const email = (req.body.email || '').trim().toLowerCase()
  const password = req.body.password || ''
  const nextUrl = safeNext(req.body.next || req.query.next)

  try {
    const user = await User.findOne({ email })
    const valid = user ? await user.verifyPassword(password) : false

    if (!valid) {
      const msg = 'Invalid email or password.'
      if (wantsJson(req)) return res.status(401).json({ errors: [msg] })
      return res.status(401).render('auth/login', { errors: [msg], values: { email }, next: nextUrl })
    }

    req.session.user = user.toJSON()
    if (wantsJson(req)) return res.json({ user: req.session.user })
    return res.redirect(nextUrl)
  } catch (err) {
    return next(err)
  }
})

// T11 - Logout (supports POST form and GET link)
function logoutHandler(req, res) {
  req.session = null
  if (wantsJson(req)) return res.json({ message: 'Logged out' })
  return res.redirect('/')
}
router.post('/logout', logoutHandler)
router.get('/logout', logoutHandler)

// Convenience API: who am I?
router.get('/me', (req, res) => {
  const user = getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Not logged in' })
  return res.json({ user })
})

module.exports = router

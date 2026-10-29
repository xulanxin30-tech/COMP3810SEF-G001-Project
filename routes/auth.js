const express = require('express')
const mongoose = require('mongoose')
const { User } = require('../models/schema')
const { requireGuest, wantsJson, getSessionUser } = require('../middleware/auth')

const router = express.Router()

// T10 helper: only allow a same-site relative path as the post-login redirect
// target. Blocks open-redirect tricks such as "//evil.com" or "/\evil.com"
// (browsers normalise a backslash to a forward slash).
function safeNext(value) {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes(':')
  ) {
    return value
  }
  return '/dashboard'
}

// T08 - Sign-up page
router.get('/signup', requireGuest, (req, res) => {
  res.render('auth/signup', { errors: [], values: {} })
})

// T08 - Sign-up API
router.post('/signup', requireGuest, async (req, res, next) => {
  const username = (req.body.username || '').trim().toLowerCase()
  const name = (req.body.name || '').trim()
  const password = req.body.password || ''
  const nextUrl = safeNext(req.body.next)

  const errors = []
  if (!/^[a-z0-9]+$/.test(username)) {
    errors.push('Username may only contain lowercase letters and numbers.')
  }
  if (name.length < 1 || name.length > 60) {
    errors.push('Name is required (1-60 characters).')
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(password)) {
    errors.push('Password must contain at least one letter and one number.')
  }

  if (errors.length > 0) {
    if (wantsJson(req)) return res.status(400).json({ errors })
    return res.status(400).render('auth/signup', { errors, values: { username, name } })
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      const msg = 'Database is not available. Start MongoDB and restart the server.'
      if (wantsJson(req)) return res.status(503).json({ errors: [msg] })
      return res.status(503).render('auth/signup', { errors: [msg], values: { username, name } })
    }
    const existing = await User.findOne({ username })
    if (existing) {
      const msg = 'This username is already taken.'
      if (wantsJson(req)) return res.status(409).json({ errors: [msg] })
      return res.status(409).render('auth/signup', { errors: [msg], values: { username, name } })
    }

    // Password is stored as plain text to match the shared User schema and the
    // seeded accounts (see seeddata.js).
    const user = new User({ username, name, password })
    await user.save()

    // T10 - rebuild the session on sign-up (helps avoid session fixation)
    req.session = { user: { username: user.username, name: user.name } }

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
  const username = (req.body.username || '').trim().toLowerCase()
  const password = req.body.password || ''
  const nextUrl = safeNext(req.body.next || req.query.next)

  try {
    if (mongoose.connection.readyState !== 1) {
      const msg = 'Database is not available. Start MongoDB and restart the server.'
      if (wantsJson(req)) return res.status(503).json({ errors: [msg] })
      return res.status(503).render('auth/login', { errors: [msg], values: { username }, next: nextUrl })
    }
    const user = await User.findOne({ username })
    // Plain-text comparison, consistent with the course schema and seed data.
    const valid = user && user.password === password

    if (!valid) {
      const msg = 'Invalid username or password.'
      if (wantsJson(req)) return res.status(401).json({ errors: [msg] })
      return res.status(401).render('auth/login', { errors: [msg], values: { username }, next: nextUrl })
    }

    // T10 - rebuild the session on login (session fixation mitigation)
    req.session = { user: { username: user.username, name: user.name } }

    if (wantsJson(req)) return res.json({ user: req.session.user })
    return res.redirect(nextUrl)
  } catch (err) {
    return next(err)
  }
})

// T11 - Logout (POST form or GET link) - clears the cookie session
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

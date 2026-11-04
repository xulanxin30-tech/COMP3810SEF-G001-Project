// Lecture 9 (p.57-61): Facebook login via Passport + passport-facebook + express-session.
//
// This module adds an OAuth login OPTION alongside the existing
// cookie-session username/password flow (Lecture 7 / T08-T12). The
// express-session + passport middleware below is scoped to the OAuth routes
// only, so it never touches req.session used by the cookie-session flow.
//
// Credentials are read from environment variables (FACEBOOK_APP_ID /
// FACEBOOK_APP_SECRET). The lecture slides show them as empty placeholders
// (clientID:'', clientSecret:'') and state you must create a Facebook app to
// obtain real values. passport-facebook refuses an empty clientID, so the
// Facebook strategy is only registered when both values are present.

const express = require('express')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const session = require('express-session')

const facebookAuth = {
  clientID: process.env.FACEBOOK_APP_ID || '',
  clientSecret: process.env.FACEBOOK_APP_SECRET || '',
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
}

const facebookConfigured = Boolean(facebookAuth.clientID && facebookAuth.clientSecret)

// Configure the Facebook authentication strategy (p.58) — only when real
// credentials are supplied, otherwise passport-facebook would throw on ''.
if (facebookConfigured) {
  passport.use(new FacebookStrategy(
    {
      clientID: facebookAuth.clientID,
      clientSecret: facebookAuth.clientSecret,
      callbackURL: facebookAuth.callbackURL
    },
    function (token, refreshToken, profile, done) {
      console.log('Facebook Profile: ' + JSON.stringify(profile))
      const user = {}
      user.id = profile.id
      user.name = profile.displayName
      console.log('user object: ' + JSON.stringify(user))
      return done(null, user) // put user object into session
    }
  ))
}

// Passport needs the ability to serialize and unserialize users out of session (p.60)
passport.serializeUser(function (user, done) {
  done(null, user)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})

// Session + passport middleware, scoped to the OAuth routes only.
const oauthSession = session({
  secret: 'tHiSiSasEcRetStr',
  resave: true,
  saveUninitialized: true
})
const oauthPassport = [passport.initialize(), passport.session()]

const router = express.Router()

// Send the user to Facebook to do the authentication (p.59)
router.get('/auth/facebook',
  oauthSession, oauthPassport,
  function (req, res, next) {
    if (!facebookConfigured) return res.redirect('/auth/login?oauth=unconfigured')
    return passport.authenticate('facebook', { scope: 'email' })(req, res, next)
  }
)

// Handle the callback after Facebook has authenticated the user (p.59-60)
router.get('/auth/facebook/callback',
  oauthSession, oauthPassport,
  function (req, res, next) {
    if (!facebookConfigured) return res.redirect('/auth/login?oauth=unconfigured')
    return passport.authenticate('facebook', { failureRedirect: '/' })(req, res, next)
  },
  function (req, res) {
    res.redirect('/content')
  }
)

// Protected content page after a successful OAuth login (p.60 successRedirect /content)
function ensureOAuthLogin (req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next()
  return res.redirect('/auth/login')
}
router.get('/content',
  oauthSession, oauthPassport, ensureOAuthLogin,
  function (req, res) {
    res.render('oauth/content', { user: req.user })
  }
)

// Log out from the OAuth session
router.get('/auth/facebook/logout',
  oauthSession, oauthPassport,
  function (req, res) {
    req.logout(function () {
      res.redirect('/')
    })
  }
)

module.exports = router
module.exports.facebookConfigured = facebookConfigured

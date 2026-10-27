// T10 - Session middleware helpers
// T12 - Access control for CRUD pages (redirect unauthenticated visitors)
//
// Usage:
//   app.use(attachCurrentUser)                   // global: views get res.locals.currentUser
//   app.use('/books', requireAuth, booksRouter)  // protect a CRUD page

function getSessionUser(req) {
  return req.session && req.session.user ? req.session.user : null
}

function wantsJson(req) {
  return req.is('application/json') || req.accepts('html', 'json') === 'json'
}

// Make the logged-in user available to every view via res.locals.currentUser
function attachCurrentUser(req, res, next) {
  res.locals.currentUser = getSessionUser(req)
  next()
}

// Protect pages/APIs: unauthenticated visitors are redirected to the login page
function requireAuth(req, res, next) {
  if (getSessionUser(req)) return next()

  if (req.path.startsWith('/api') || wantsJson(req)) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl)}`)
}

// Keep logged-in users away from the login/sign-up pages
function requireGuest(req, res, next) {
  if (getSessionUser(req)) return res.redirect('/dashboard')
  return next()
}

module.exports = {
  getSessionUser,
  wantsJson,
  attachCurrentUser,
  requireAuth,
  requireGuest
}

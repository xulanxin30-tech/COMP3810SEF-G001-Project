const express = require('express')
const router = express.Router()

// T12 example: this page is only reachable when logged in.
// Mount it in app.js as:  app.use('/dashboard', requireAuth, dashboardRouter)
router.get('/', (req, res) => {
  res.render('dashboard')
})

module.exports = router

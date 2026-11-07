const express = require('express')
const path = require('path')
const sessionConfig = require('./config/session')
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const apiRouter = require('./routes/api')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

const app = express()
app.set('trust proxy', 1)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(sessionConfig)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null
    next()
})
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/api', apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app

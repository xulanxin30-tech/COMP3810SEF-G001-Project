const app = require('./app')
const PORT = process.env.PORT || 3000

const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Library Management System',
        features: [
            'View Books',
            'Search Books',
            'Manage Library Records'
        ]
    })
})

router.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

router.get('/books', (req, res) => {
    res.render('books/list', {
        books: []
    })
})
module.exports = router

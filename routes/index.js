
const express = require('express')
const router = express.Router()

// Temporary book data for testing
let books = [
    {
        _id: '1',
        title: 'Harry Potter',
        author: 'J.K. Rowling',
        category: 'Fantasy',
        publisher: 'Bloomsbury',
        publishYear: 1997
    },
    {
        _id: '2',
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupery',
        category: 'Fiction',
        publisher: 'Reynal & Hitchcock',
        publishYear: 1943
    }
]

let nextId = 3

// Homepage
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

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

// READ: Display all books
router.get('/books', (req, res) => {
    res.render('books/list', {
        books: books
    })
})

// CREATE: Display Add Book page
router.get('/books/new', (req, res) => {
    res.render('books/create')
})

// CREATE: Add a new book
router.post('/books', (req, res) => {
    const newBook = {
        _id: String(nextId++),
        title: req.body.title,
        author: req.body.author,
        category: req.body.category,
        publisher: req.body.publisher,
        publishYear: req.body.publishYear
            ? Number(req.body.publishYear)
            : undefined
    }

    books.push(newBook)

    res.redirect('/books')
})

// UPDATE: Display Edit Book page
router.get('/books/:id/edit', (req, res) => {
    const book = books.find(b => b._id === req.params.id)

    if (!book) {
        return res.status(404).send('Book not found')
    }

    res.render('books/edit', {
        book: book
    })
})

// UPDATE: Save edited book
router.post('/books/:id/edit', (req, res) => {
    const book = books.find(b => b._id === req.params.id)

    if (!book) {
        return res.status(404).send('Book not found')
    }

    book.title = req.body.title
    book.author = req.body.author
    book.category = req.body.category
    book.publisher = req.body.publisher
    book.publishYear = req.body.publishYear
        ? Number(req.body.publishYear)
        : undefined

    res.redirect('/books')
})

// DELETE: Display confirmation page
router.get('/books/:id/delete', (req, res) => {
    const book = books.find(b => b._id === req.params.id)

    if (!book) {
        return res.status(404).send('Book not found')
    }

    res.render('books/delete', {
        book: book
    })
})

// DELETE: Remove a book
router.post('/books/:id/delete', (req, res) => {
    const bookIndex = books.findIndex(
        b => b._id === req.params.id
    )

    if (bookIndex === -1) {
        return res.status(404).send('Book not found')
    }

    books.splice(bookIndex, 1)

    res.redirect('/books')
})

module.exports = router


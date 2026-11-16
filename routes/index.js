
const express = require('express')
const router = express.Router()
const { Book } = require('../models/schema')

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
router.get('/books', async (req, res, next) => {
    try {
        const books = await Book.find()

        res.render('books/list', {
            books: books
        })
    } catch (error) {
        next(error)
    }
})

// SEARCH: Search books by different criteria
router.get('/books/search', async (req, res, next) => {
    try {
        const searchType = req.query.type || 'title'
        const searchText = req.query.q || ''

        const allowedFields = [
            'title',
            'author',
            'category',
            'publisher',
            'publishYear'
        ]

        if (!allowedFields.includes(searchType)) {
            return res.status(400).send('Invalid search type')
        }

        let searchCondition = {}

        if (searchText.trim() !== '') {

            if (searchType === 'publishYear') {
                const year = Number(searchText)

                if (!Number.isInteger(year)) {
                    return res.status(400).send('Please enter a valid year')
                }

                searchCondition[searchType] = year

            } else {
                searchCondition[searchType] = {
                    $regex: searchText,
                    $options: 'i'
                }
            }
        }

        const books = await Book.find(searchCondition)

        res.render('books/search', {
            books: books,
            searchText: searchText,
            searchType: searchType
        })

    } catch (error) {
        next(error)
    }
})

// CREATE: Display Add Book page
router.get('/books/new', (req, res) => {
    res.render('books/create')
})

// CREATE: Add a new book
router.post('/books', async (req, res, next) => {
    try {
        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            category: req.body.category,
            publisher: req.body.publisher,
            publishYear: req.body.publishYear
                ? Number(req.body.publishYear)
                : undefined
        })

        await newBook.save()

        res.redirect('/books')

    } catch (error) {
        next(error)
    }
})

// UPDATE: Display Edit Book page
router.get('/books/:id/edit', async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)

        if (!book) {
            return res.status(404).send('Book not found')
        }

        res.render('books/edit', {
            book: book
        })

    } catch (error) {
        next(error)
    }
})

// UPDATE: Save edited book
router.post('/books/:id/edit', async (req, res, next) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                author: req.body.author,
                category: req.body.category,
                publisher: req.body.publisher,
                publishYear: req.body.publishYear
                    ? Number(req.body.publishYear)
                    : undefined
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedBook) {
            return res.status(404).send('Book not found')
        }

        res.redirect('/books')

    } catch (error) {
        next(error)
    }
})

// DELETE: Display confirmation page
router.get('/books/:id/delete', async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)

        if (!book) {
            return res.status(404).send('Book not found')
        }

        res.render('books/delete', {
            book: book
        })

    } catch (error) {
        next(error)
    }
})

// DELETE: Remove a book
router.post('/books/:id/delete', async (req, res, next) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id)

        if (!deletedBook) {
            return res.status(404).send('Book not found')
        }

        res.redirect('/books')

    } catch (error) {
        next(error)
    }
})

module.exports = router

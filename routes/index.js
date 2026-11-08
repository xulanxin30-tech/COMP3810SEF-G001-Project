const express = require('express')
const router = express.Router()
const { Book } = require('../models/schema')

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

router.get('/books/new', (req, res) => {
    res.render('books/create')
})

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

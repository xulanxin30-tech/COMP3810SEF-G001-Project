// Create by XU Lanxin
// RESTful CRUD API backed by MongoDB.
// Request flow: curl (HTTP) -> /api/items router -> Mongoose model -> MongoDB.
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Item } = require('../models/schema');

// Fail fast with a clear message when MongoDB is not connected, instead of
// letting Mongoose buffer the operation until it times out.
router.use((req, res, next) => {
  const state = mongoose.connection.readyState;
  if (state === 0 || state === 3) {
    return res.status(503).json({
      error: 'MongoDB is not connected. Set MONGODB_URI in .env (see .env.example), then restart the server.'
    });
  }
  next();
});

// T22: GET /api/items - Retrieve all documents from MongoDB
router.get('/items', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// T23: POST /api/items - Insert a new document into MongoDB
router.post('/items', async (req, res, next) => {
  try {
    const { name, completed } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newItem = await Item.create({
      name,
      completed: completed === undefined ? false : completed
    });
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

// T24: PUT /api/items/:id - Update a document by its MongoDB _id
router.put('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const { name, completed } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (completed !== undefined) update.completed = completed;

    const item = await Item.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// T25: DELETE /api/items/:id - Remove a document by its MongoDB _id
router.delete('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

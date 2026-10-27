// Create by XU Lanxin
const express = require('express');
const router = express.Router();

// In-memory data store
let items = [
  { id: 1, name: 'Task example', completed: false }
];
let nextId = 2;

// T22: GET /api/items - Retrieve all items
router.get('/items', (req, res) => {
  res.json(items);
});

// T23: POST /api/items - Create a new item
router.post('/items', (req, res) => {
  const { name, completed } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const newItem = {
    id: nextId++,
    name,
    completed: completed || false
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// T24: PUT /api/items/:id - Update an existing item by ID
router.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const { name, completed } = req.body;
  if (name !== undefined) item.name = name;
  if (completed !== undefined) item.completed = completed;
  res.json(item);
});

// T25: DELETE /api/items/:id - Delete an item by ID
router.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  res.status(204).send(); // 204 No Content
});

module.exports = router;

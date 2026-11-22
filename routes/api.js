// Create by XU Lanxin
// RESTful CRUD API backed by MongoDB.
// Request flow: curl (HTTP) -> /api/items router -> Mongoose model -> MongoDB.
//
// An item can be addressed by two kinds of key:
//   1. a real MongoDB _id (24 hex characters) - the original behaviour, or
//   2. a stable `version` string such as "v1" - used by the README curl tests.
// Any path key that is NOT a valid ObjectId is treated as a version key. The
// published curl commands therefore contain no machine-generated ID and work
// unchanged on every laptop / Ubuntu VM, including after a VM is recreated.
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

// Resolve a URL key into a MongoDB query. A 24-hex ObjectId keeps the legacy
// behaviour; every other value (v1, v2, ...) is looked up as `version`.
function queryForKey(key) {
  const value = String(key).trim();
  return mongoose.Types.ObjectId.isValid(value)
    ? { _id: value }
    : { version: value };
}

// T21: GET /api/items - Retrieve all documents from MongoDB
router.get('/items', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:key - Retrieve one item by version (e.g. v1) or MongoDB _id
router.get('/items/:key', async (req, res, next) => {
  try {
    const item = await Item.findOne(queryForKey(req.params.key));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// T23: POST /api/items - Insert a document into MongoDB.
// The `version` field is stored in MongoDB; defaulting to "v1" means the
// MongoDB side always has a version even if the caller does not send one.
// Upserting by version makes the command safe to re-run (no duplicates).
router.post('/items', async (req, res, next) => {
  try {
    const { name, completed } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const version = req.body.version ? String(req.body.version).trim() : 'v1';
    const item = await Item.findOneAndUpdate(
      { version },
      { $set: { name, completed: completed === undefined ? false : completed } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// T24: PUT /api/items/:key - Update a document by version (e.g. v1) or MongoDB _id.
// Version-based updates are upserted so the curl command succeeds even on a
// completely fresh database, with no seed step and no ID to look up first.
router.put('/items/:key', async (req, res, next) => {
  try {
    const key = String(req.params.key).trim();
    const isVersionKey = !mongoose.Types.ObjectId.isValid(key);
    const { name, completed } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (completed !== undefined) update.completed = completed;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'Provide at least one field to update: name or completed' });
    }

    const updateDoc = { $set: update };
    // When a version key does not exist yet, give the new document a name so
    // the schema's required validator still passes on upsert.
    if (isVersionKey && update.name === undefined) {
      updateDoc.$setOnInsert = { name: `Task ${key}` };
    }

    const item = await Item.findOneAndUpdate(queryForKey(key), updateDoc, {
      new: true,
      upsert: isVersionKey,
      runValidators: true,
      setDefaultsOnInsert: true
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// T25: DELETE /api/items/:key - Remove a document by version (e.g. v1) or MongoDB _id.
// Deleting by version is idempotent: running it twice, or before any item
// exists, still returns 204 so testers can run the commands in any order.
router.delete('/items/:key', async (req, res, next) => {
  try {
    const key = String(req.params.key).trim();
    if (!mongoose.Types.ObjectId.isValid(key)) {
      await Item.deleteMany({ version: key });
      return res.status(204).send();
    }
    const item = await Item.findByIdAndDelete(key);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// How to use? (BASH)
// Get all items = "curl http://localhost:3000/api/items"
// Create a new item = "curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"name":"New Task","completed":false}'"
// Update item with id[1] = curl -X PUT http://localhost:3000/api/items/1 -H "Content-Type: application/json" -d '{"name":"Updated Task","completed":true}'
// Delete item with id[1] = curl -X DELETE http://localhost:3000/api/items/1


// In-memory database representing your library's books
let books = [
    { 
        id: 1,
        name: "example book",
        author: "John Doe",
        stock: 5,
        availableStock: 3,
        completed: false
    },
    { 
        id: 1,
        name: "popular book",
        author: "Jane Smith",
        stock: 2,
        availableStock: 0,
        completed: false
    },
];

// GET method: GET all items
app.get('/api/items', (req,res) => {
    res.json(items);
});

// GET method: Get Specific item by ID
app.get('api/items/:id', (req,res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find(i => i.id === itemId); // why tf?
    if (!item) return res.status(404).json({ error: 'Item not found' }); // where {}
    res.json(item);
});

// Create new item
app.post('/api/items', (req,res) => {
    const {name, completed} = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const newItem {
        id: items.length > 0 ? items[items.length - 1].id + 1 : 1, //tf?
        name: name,
        completed: completed !== undefined ? complete : false //tf?
    };

    items.push(newItem);
    res.status(201).json(newItem);
});

// update item w/id
app.put('api/items/:id', (req,res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find(i => i.id === itemId);

    if (!item) res.status(404).json({ error: 'Item not found' }); 

    const {name, completed} = req.body;
    if (name !== undefined) item.name = name;
    if (completed !== undefined) item.completed = completed;

    res.json(item);
});

// 5. DELETE: Delete an item with id
app.delete('/api/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    const deletedItem = items.splice(itemIndex, 1);
    res.json({ message: 'Item deleted successfully', item: deletedItem[0] });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
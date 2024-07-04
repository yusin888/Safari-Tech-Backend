const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./db');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/startups', async (req, res) => {
    try {
        const db = getDb();
        const startups = await db.collection('startups').find({}).toArray();
        res.json(startups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/startups/:name', async (req, res) => {
    try {
        const db = getDb();
        const name = req.params.name;
        const startup = await db.collection('startups').findOne({ name: name });
        if (startup) {
            res.json(startup);
        } else {
            res.status(404).json({ message: 'Startup not found' });
    }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
